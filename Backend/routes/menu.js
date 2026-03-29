import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu_items");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT category FROM menu_items");
    const categories = result.rows.map(r => r.category);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
