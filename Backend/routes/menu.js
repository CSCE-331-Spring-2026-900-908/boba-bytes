import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET all menu items
router.get("/items", async (req, res) => {
  try {
<<<<<<< Updated upstream
    const result = await pool.query(
      "SELECT * FROM menu ORDER BY item_type ASC, item_name ASC"
    );
=======
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_item_id");
>>>>>>> Stashed changes
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET categories
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

router.post("/items", async (req, res) => {
  const { item_name, item_cost, item_type, image } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO menu (item_name, item_cost, item_type, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [item_name, item_cost, item_type, image || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { item_name, item_cost, item_type, image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu
       SET item_name = $1, item_cost = $2, item_type = $3, image = $4
       WHERE menu_item_id = $5
       RETURNING *`,
      [item_name, item_cost, item_type, image || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM menu WHERE menu_item_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted", item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;

