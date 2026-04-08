import express from "express";
import pool from "../db/pool.js";

const router = express.Router();


router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu ORDER BY item_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /menu/items error:", err);
    res.status(500).send("Server error");
  }
});


router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT item_type FROM menu WHERE item_type IS NOT NULL ORDER BY item_type ASC"
    );
    const categories = result.rows.map((r) => r.item_type);
    res.json(categories);
  } catch (err) {
    console.error("GET /menu/categories error:", err);
    res.status(500).send("Server error");
  }
});

export default router;
