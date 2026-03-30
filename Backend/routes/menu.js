import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT item_type FROM menu");
    const categories = result.rows.map(r => r.item_type).filter(Boolean);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
