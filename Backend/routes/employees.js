import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET ALL 
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY employee_no");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD
router.post("/", async (req, res) => {
  const { first_name, last_name, is_manager, email, password } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, is_manager, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [first_name, last_name, is_manager, email, password]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//UPDATE
router.put("/:employee_no", async (req, res) => {
  const { employee_no } = req.params;
  const { first_name, last_name, is_manager, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees
       SET first_name=$1, last_name=$2, is_manager=$3, email=$4
       WHERE employee_no=$5
       RETURNING *`,
      [first_name, last_name, is_manager, email, employee_no]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE
router.delete("/:employee_no", async (req, res) => {
  const { employee_no } = req.params;

  try {
    await pool.query(
      `DELETE FROM employees WHERE employee_no=$1`,
      [employee_no]
    );

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

