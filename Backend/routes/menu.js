import express from "express";
import pool from "../db/pool.js";
import { imageMap } from "../data/imageMap.js";

const router = express.Router();

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const badRequestError = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const normalizeName = (value = "") => value.trim().toLowerCase().replace(/\s+/g, " ");

const imageMapNormalized = Object.fromEntries(
  Object.entries(imageMap).map(([name, path]) => [normalizeName(name), path])
);

const getImageForItem = (itemName = "") => imageMapNormalized[normalizeName(itemName)] || null;

const normalizeRecipe = (recipe) => {
  if (recipe === undefined || recipe === null) {
    return [];
  }

  if (!Array.isArray(recipe)) {
    throw badRequestError("Recipe must be an array of ingredient rows");
  }

  const normalized = [];
  const seenInventoryIds = new Set();

  recipe.forEach((row, index) => {
    const rawInventoryId = row?.inventory_id ?? row?.inventory_item_id ?? row?.inv_item_id;
    const rawQuantity = row?.quantity;
    const hasInventory = rawInventoryId !== "" && rawInventoryId !== null && rawInventoryId !== undefined;
    const hasQuantity = rawQuantity !== "" && rawQuantity !== null && rawQuantity !== undefined;

    if (!hasInventory && !hasQuantity) {
      return;
    }

    if (!hasInventory || !hasQuantity) {
      throw badRequestError(`Recipe row ${index + 1} must include both ingredient and quantity`);
    }

    const inventory_id = toNumber(rawInventoryId);
    const quantity = toNumber(rawQuantity);

    if (!Number.isInteger(inventory_id) || inventory_id <= 0) {
      throw badRequestError(`Recipe row ${index + 1} has an invalid ingredient`);
    }

    if (quantity === null || quantity <= 0) {
      throw badRequestError(`Recipe row ${index + 1} quantity must be greater than 0`);
    }

    if (seenInventoryIds.has(inventory_id)) {
      throw badRequestError(`Recipe has duplicate ingredient inventory_id ${inventory_id}`);
    }

    seenInventoryIds.add(inventory_id);
    normalized.push({ inventory_id, quantity });
  });

  return normalized;
};

const assertInventoryExists = async (client, recipe) => {
  if (!recipe.length) {
    return;
  }

  const inventoryIds = recipe.map((row) => row.inventory_id);
  const result = await client.query(
    `SELECT inv_item_id FROM inventory WHERE inv_item_id = ANY($1::int[])`,
    [inventoryIds]
  );

  const existingIds = new Set(result.rows.map((row) => Number(row.inv_item_id)));
  const missingIds = inventoryIds.filter((id) => !existingIds.has(Number(id)));

  if (missingIds.length) {
    throw badRequestError(`Recipe contains unknown inventory ids: ${missingIds.join(", ")}`);
  }
};

const replaceRecipe = async (client, menuItemId, recipe) => {
  await client.query("DELETE FROM recipeitems WHERE menu_item_id = $1", [menuItemId]);

  if (!recipe.length) {
    return;
  }

  await client.query("LOCK TABLE recipeitems IN EXCLUSIVE MODE");
  const maxRecipeIdResult = await client.query(
    "SELECT COALESCE(MAX(recipe_id), 0) AS max_recipe_id FROM recipeitems"
  );
  let nextRecipeId = Number(maxRecipeIdResult.rows[0].max_recipe_id) + 1;

  for (const row of recipe) {
    const insertResult = await client.query(
      `INSERT INTO recipeitems (recipe_id, menu_item_id, inv_item_id, quantity, unit_of_measure)
       SELECT $1, $2, $3, $4, i.unit_of_measure
       FROM inventory i
       WHERE i.inv_item_id = $3`,
      [nextRecipeId, menuItemId, row.inventory_id, row.quantity]
    );

    if (insertResult.rowCount === 0) {
      throw badRequestError(`Recipe contains unknown inventory id: ${row.inventory_id}`);
    }

    nextRecipeId += 1;
  }
};

router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_item_id ASC");

    const itemsWithImages = result.rows.map(item => ({
      ...item,
      image: getImageForItem(item.item_name)
    }));

    res.json(itemsWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/items", async (req, res) => {
  const { item_name, item_cost, item_type, recipe } = req.body;

  if (!item_name || item_cost === undefined || item_cost === null || !item_type) {
    return res.status(400).json({ error: "Missing requirements: item name, item cost, item type" });
  }

  const parsedCost = toNumber(item_cost);
  if (parsedCost === null || parsedCost < 0) {
    return res.status(400).json({ error: "Item cost must be a valid non-negative number" });
  }

  try {
    const parsedRecipe = normalizeRecipe(recipe);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

    const maxID = await client.query("SELECT COALESCE(MAX(menu_item_id), 0) as mid FROM menu");
    const nextID = Number(maxID.rows[0].mid) + 1;
    const result = await client.query(
        `INSERT INTO menu (menu_item_id, item_name, item_cost, item_type)
         VALUES($1, $2, $3, $4)
         RETURNING *`,
        [nextID, item_name, parsedCost, item_type]
    );

    await assertInventoryExists(client, parsedRecipe);
    await replaceRecipe(client, nextID, parsedRecipe);
    await client.query("COMMIT");

    res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    let errorMessage = "Server error: " + err.message;
    console.error("POST /menu/items error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try{
    await pool.query(
        `DELETE FROM recipeitems WHERE menu_item_id = $1`,
        [id]
    );
    await pool.query(
        `DELETE FROM menu WHERE menu_item_id = $1`,
        [id]
    );
    res.json({message: "Menu item deleted successfully."});
  } catch (err) {
    let errorMessage = "Server error: " + err.message;
    console.error("POST /menu/items error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
})

router.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { item_name, item_cost, item_type, recipe } = req.body;

  if (!item_name || item_cost === undefined || item_cost === null || !item_type) {
    return res.status(400).json({ error: "Missing requirements: item name, item cost, item type" });
  }

  const parsedCost = toNumber(item_cost);
  if (parsedCost === null || parsedCost < 0) {
    return res.status(400).json({ error: "Item cost must be a valid non-negative number" });
  }

  try{
    const parsedRecipe = normalizeRecipe(recipe);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
          `UPDATE menu
           SET item_name = $1, item_cost = $2, item_type = $3
           WHERE menu_item_id = $4
           RETURNING *`,
          [item_name, parsedCost, item_type, id]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Menu Item not found" });
      }

      await assertInventoryExists(client, parsedRecipe);
      await replaceRecipe(client, id, parsedRecipe);
      await client.query("COMMIT");

      res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err){
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    let errorMessage = "Server error: " + err.message;
    console.error("POST /menu/items error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
})

router.get("/items/:id/recipe", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
          ri.menu_item_id,
          ri.inv_item_id AS inventory_id,
          ri.quantity,
          i.item_name AS inventory_name,
          ri.unit_of_measure AS inventory_unit
       FROM recipeitems ri
       LEFT JOIN inventory i ON i.inv_item_id = ri.inv_item_id
       WHERE ri.menu_item_id = $1
       ORDER BY i.item_name ASC NULLS LAST, ri.inv_item_id ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /menu/items/:id/recipe error:", err);
    res.status(500).send("Server error");
  }
});

router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT item_type FROM menu ORDER BY item_type"
    );
    const categories = result.rows.map(r => r.item_type);
    res.json(categories);
  } catch (err) {
    console.error("GET /menu/categories error:", err);
    res.status(500).send("Server error");
  }
});

router.get("/toppings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT topping_id, topping_name, topping_cost FROM toppings ORDER BY topping_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /menu/toppings error:", err);
    res.status(500).send("Server error");
  }
});

export default router;

