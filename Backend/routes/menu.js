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

router.post("/items", async (req, res) => {
  const {item_name, item_cost, item_type} = req.body;
  if(!item_name || !item_cost || !item_type) {
    console.log("returning here")
    return res.status(400).json({ error: "Missing requirements: item name, item cost, item type" });
  }
  try {
    const maxID = await pool.query("SELECT MAX(menu_item_id) as mid FROM MENU");
    let nextID = maxID.rows[0].mid + 1;
    const result = await pool.query(
        `INSERT INTO menu (menu_item_id, item_name, item_cost, item_type)
         VALUES($1, $2, $3, $4)
         RETURNING *`,
        [nextID, item_name, item_cost, item_type]
    );
    res.json(result.rows);
  } catch (err) {
    let errorMessage = "Server error: " + err.message;
    console.error("POST /menu/items error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try{
    await pool.query(
        `DELETE FROM recipeitems WHERE menu_item_id=${id}`,
    );
    await pool.query(
        `DELETE FROM menu WHERE menu_item_id = ${id}`,
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
  const {item_name, item_cost, item_type} = req.body;
  try{
    const result = await pool.query(
        `UPDATE menu
         SET item_name = $1, item_cost = $2, item_type = $3
         WHERE menu_item_id = $4
         RETURNING *`,
        [item_name, item_cost, item_type, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu Item not found" });
    }
    res.json(result.rows[0]);
  } catch (err){
    let errorMessage = "Server error: " + err.message;
    console.error("POST /menu/items error:", err);
    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
})
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
