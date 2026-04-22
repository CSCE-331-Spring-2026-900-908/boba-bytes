import pool from "../db/pool.js";

const asPositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const asPositiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const normalizeIceLevel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getIceMultiplier = (iceLevel) => {
  switch (normalizeIceLevel(iceLevel)) {
    case "no ice":
      return 0;
    case "less ice":
      return 0.5;
    case "extra ice":
      return 1.5;
    default:
      return 1;
  }
};

const isIceInventoryItem = (name) => /\bice\b/i.test(String(name || ""));
const DEFAULT_ICE_USAGE_PER_DRINK = 1;

const buildOrderLines = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("No items in order");
    err.status = 400;
    throw err;
  }

  const lines = [];

  items.forEach((item, itemIndex) => {
    const menuItemId = asPositiveInt(item?.menu_item_id);
    const quantity = asPositiveNumber(item?.quantity);

    if (!menuItemId || !quantity) {
      const err = new Error(`Invalid menu item at index ${itemIndex}`);
      err.status = 400;
      throw err;
    }

    lines.push({
      menu_item_id: menuItemId,
      quantity,
      ice_level: item?.ice_level ?? item?.ice ?? null
    });

    if (Array.isArray(item.toppings)) {
      item.toppings.forEach((topping, toppingIndex) => {
        const toppingId = asPositiveInt(topping?.topping_id ?? topping?.menu_item_id);
        const toppingQtyPerDrink = asPositiveNumber(topping?.quantity ?? 1);

        if (!toppingId || !toppingQtyPerDrink) {
          const err = new Error(
            `Invalid topping at item index ${itemIndex}, topping index ${toppingIndex}`
          );
          err.status = 400;
          throw err;
        }

        lines.push({ menu_item_id: toppingId, quantity: toppingQtyPerDrink * quantity });
      });
    }
  });

  return lines;
};

const aggregateRecipeUsage = (orderLines, recipeRows, fallbackIceInvItemId = null) => {
  const recipeByMenuId = new Map();
  recipeRows.forEach((row) => {
    const list = recipeByMenuId.get(Number(row.menu_item_id)) || [];
    list.push(row);
    recipeByMenuId.set(Number(row.menu_item_id), list);
  });

  const usageByInventoryId = new Map();

  orderLines.forEach((line) => {
    const recipeForItem = recipeByMenuId.get(Number(line.menu_item_id)) || [];
    let hasIceInRecipe = false;

    recipeForItem.forEach((recipe) => {
      const invItemId = Number(recipe.inv_item_id);
      let requiredQty = Number(recipe.quantity) * Number(line.quantity);

      if (isIceInventoryItem(recipe.item_name)) {
        hasIceInRecipe = true;
      }

      if (line.ice_level && isIceInventoryItem(recipe.item_name)) {
        requiredQty *= getIceMultiplier(line.ice_level);
      }

      usageByInventoryId.set(
        invItemId,
        (usageByInventoryId.get(invItemId) || 0) + requiredQty
      );
    });

    if (line.ice_level && !hasIceInRecipe && fallbackIceInvItemId) {
      const fallbackIceQty =
        DEFAULT_ICE_USAGE_PER_DRINK * Number(line.quantity) * getIceMultiplier(line.ice_level);
      if (fallbackIceQty > 0) {
        usageByInventoryId.set(
          Number(fallbackIceInvItemId),
          (usageByInventoryId.get(Number(fallbackIceInvItemId)) || 0) + fallbackIceQty
        );
      }
    }
  });

  return usageByInventoryId;
};

export async function placeOrderWithInventory({ items, total, paymentType = "cashier" }) {
  const orderLines = buildOrderLines(items);
  const parsedTotal = Number.isFinite(Number(total)) ? Number(total) : 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (order_total, payment_type, timestamp)
       VALUES ($1, $2, NOW() AT TIME ZONE 'America/Chicago')
       RETURNING order_id`,
      [parsedTotal, paymentType]
    );

    const orderId = Number(orderResult.rows[0].order_id);

    for (const line of orderLines) {
      await client.query(
        `INSERT INTO ordereditems (order_id, menu_item_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, line.menu_item_id, line.quantity]
      );
    }

    const menuIds = [...new Set(orderLines.map((line) => Number(line.menu_item_id)))];
    const recipeResult = await client.query(
      `SELECT r.menu_item_id, r.inv_item_id, r.quantity, i.item_name
       FROM recipeitems r
       JOIN inventory i ON i.inv_item_id = r.inv_item_id
       WHERE r.menu_item_id = ANY($1::int[])`,
      [menuIds]
    );

    const fallbackIceResult = await client.query(
      `SELECT inv_item_id
       FROM inventory
       WHERE LOWER(item_name) LIKE '%ice%'
       ORDER BY CASE
         WHEN LOWER(item_name) = 'ice' THEN 0
         WHEN LOWER(item_name) LIKE 'ice %' THEN 1
         WHEN LOWER(item_name) LIKE '% ice%' THEN 2
         ELSE 3
       END,
       inv_item_id ASC
       LIMIT 1`
    );
    const fallbackIceInvItemId = fallbackIceResult.rows[0]?.inv_item_id
      ? Number(fallbackIceResult.rows[0].inv_item_id)
      : null;

    const usageByInventoryId = aggregateRecipeUsage(
      orderLines,
      recipeResult.rows,
      fallbackIceInvItemId
    );

    if (usageByInventoryId.size > 0) {
      const inventoryIds = [...usageByInventoryId.keys()];
      const inventoryResult = await client.query(
        `SELECT inv_item_id, quantity
         FROM inventory
         WHERE inv_item_id = ANY($1::int[])
         FOR UPDATE`,
        [inventoryIds]
      );

      const inventoryById = new Map(
        inventoryResult.rows.map((row) => [Number(row.inv_item_id), Number(row.quantity)])
      );

      for (const [invItemId, usedQty] of usageByInventoryId.entries()) {
        const availableQty = inventoryById.get(invItemId);

        if (availableQty === undefined) {
          const err = new Error(`Inventory item ${invItemId} referenced by recipe was not found`);
          err.status = 400;
          throw err;
        }

        if (availableQty < usedQty) {
          const err = new Error(`Insufficient inventory for item ${invItemId}`);
          err.status = 409;
          err.detail = { inv_item_id: invItemId, needed: usedQty, available: availableQty };
          throw err;
        }
      }

      for (const [invItemId, usedQty] of usageByInventoryId.entries()) {
        await client.query(
          `UPDATE inventory
           SET quantity = quantity - $1
           WHERE inv_item_id = $2`,
          [usedQty, invItemId]
        );
      }
    }

    await client.query("COMMIT");
    return { order_id: orderId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

