import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET all menu items
router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu ORDER BY item_type, item_name");
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
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;

