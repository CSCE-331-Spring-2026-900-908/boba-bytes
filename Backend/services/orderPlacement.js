import pool from "../db/pool.js";

const asPositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const asPositiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

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

    lines.push({ menu_item_id: menuItemId, quantity });

    if (Array.isArray(item.toppings)) {
      item.toppings.forEach((topping, toppingIndex) => {
        const toppingId = asPositiveInt(topping?.topping_id ?? topping?.menu_item_id);
        const toppingQty = asPositiveNumber(topping?.quantity ?? 1);

        if (!toppingId || !toppingQty) {
          const err = new Error(
            `Invalid topping at item index ${itemIndex}, topping index ${toppingIndex}`
          );
          err.status = 400;
          throw err;
        }

        lines.push({ menu_item_id: toppingId, quantity: toppingQty });
      });
    }
  });

  return lines;
};

const aggregateRecipeUsage = (orderLines, recipeRows) => {
  const recipeByMenuId = new Map();
  recipeRows.forEach((row) => {
    const list = recipeByMenuId.get(Number(row.menu_item_id)) || [];
    list.push(row);
    recipeByMenuId.set(Number(row.menu_item_id), list);
  });

  const usageByInventoryId = new Map();

  orderLines.forEach((line) => {
    const recipeForItem = recipeByMenuId.get(Number(line.menu_item_id)) || [];
    recipeForItem.forEach((recipe) => {
      const invItemId = Number(recipe.inv_item_id);
      const requiredQty = Number(recipe.quantity) * Number(line.quantity);
      usageByInventoryId.set(
        invItemId,
        (usageByInventoryId.get(invItemId) || 0) + requiredQty
      );
    });
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
      `SELECT menu_item_id, inv_item_id, quantity
       FROM recipeitems
       WHERE menu_item_id = ANY($1::int[])`,
      [menuIds]
    );

    const usageByInventoryId = aggregateRecipeUsage(orderLines, recipeResult.rows);

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

