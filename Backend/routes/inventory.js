import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeOptionalDate = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  return value;
};

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY inv_item_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inventory error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const {
    item_name,
    quantity,
    unit_of_measure,
    item_cost,
    threshold_count,
    last_order_date
  } = req.body;

  if (!item_name || quantity === undefined || !unit_of_measure || item_cost === undefined) {
    return res.status(400).json({
      error: "Missing required fields: item_name, quantity, unit_of_measure, item_cost"
    });
  }

  const parsedQuantity = toNumber(quantity);
  const parsedItemCost = toNumber(item_cost);
  const parsedThreshold =
    threshold_count === "" || threshold_count === null || threshold_count === undefined
      ? null
      : toNumber(threshold_count);

  if (parsedQuantity === null || parsedQuantity < 0) {
    return res.status(400).json({ error: "Quantity must be a valid non-negative number" });
  }

  if (parsedItemCost === null || parsedItemCost < 0) {
    return res.status(400).json({ error: "Item cost must be a valid non-negative number" });
  }

  if (parsedThreshold !== null && parsedThreshold < 0) {
    return res.status(400).json({ error: "Threshold count must be a valid non-negative number" });
  }

  try {
    const maxResult = await pool.query("SELECT COALESCE(MAX(inv_item_id), 0) AS max_id FROM inventory");
    const nextInvItemId = Number(maxResult.rows[0].max_id) + 1;

    const result = await pool.query(
      `INSERT INTO inventory (
          inv_item_id,
          item_name,
          quantity,
          unit_of_measure,
          item_cost,
          threshold_count,
          last_order_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        nextInvItemId,
        item_name,
        parsedQuantity,
        unit_of_measure,
        parsedItemCost,
        parsedThreshold,
        normalizeOptionalDate(last_order_date)
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    const errorMessage = "Server error: " + err.message;
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

router.put("/:inv_item_id", async (req, res) => {
  const { inv_item_id } = req.params;
  const {
    item_name,
    quantity,
    unit_of_measure,
    item_cost,
    threshold_count,
    last_order_date
  } = req.body;

  if (!item_name || quantity === undefined || !unit_of_measure || item_cost === undefined) {
    return res.status(400).json({
      error: "Missing required fields: item_name, quantity, unit_of_measure, item_cost"
    });
  }

  const parsedQuantity = toNumber(quantity);
  const parsedItemCost = toNumber(item_cost);
  const parsedThreshold =
    threshold_count === "" || threshold_count === null || threshold_count === undefined
      ? null
      : toNumber(threshold_count);

  if (parsedQuantity === null || parsedQuantity < 0) {
    return res.status(400).json({ error: "Quantity must be a valid non-negative number" });
  }

  if (parsedItemCost === null || parsedItemCost < 0) {
    return res.status(400).json({ error: "Item cost must be a valid non-negative number" });
  }

  if (parsedThreshold !== null && parsedThreshold < 0) {
    return res.status(400).json({ error: "Threshold count must be a valid non-negative number" });
  }

  try {
    const result = await pool.query(
      `UPDATE inventory
       SET item_name = $1,
           quantity = $2,
           unit_of_measure = $3,
           item_cost = $4,
           threshold_count = $5,
           last_order_date = $6
       WHERE inv_item_id = $7
       RETURNING *`,
      [
        item_name,
        parsedQuantity,
        unit_of_measure,
        parsedItemCost,
        parsedThreshold,
        normalizeOptionalDate(last_order_date),
        inv_item_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    const errorMessage = "Server error: " + err.message;
    console.error("PUT /inventory/:inv_item_id error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

router.delete("/:inv_item_id", async (req, res) => {
  const { inv_item_id } = req.params;

  try {
    const result = await pool.query("DELETE FROM inventory WHERE inv_item_id = $1 RETURNING *", [
      inv_item_id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ message: "Inventory item deleted" });
  } catch (err) {
    const errorMessage = "Server error: " + err.message;
    console.error("DELETE /inventory/:inv_item_id error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

export default router;
