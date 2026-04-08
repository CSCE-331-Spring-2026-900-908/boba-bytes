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

  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields: first_name, last_name, email, password" });
  }

  try {
    const countResult = await pool.query("SELECT MAX(employee_no) AS max_no FROM employees");
    const nextEmployeeNo = (countResult.rows[0].max_no || 0) + 1;

    const result = await pool.query(
      `INSERT INTO employees (employee_no, first_name, last_name, is_manager, email, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nextEmployeeNo, first_name, last_name, is_manager || false, email, password]
    );

    console.log("Employee inserted successfully:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding employee - Full error:", err);
    console.error("Error code:", err.code);
    console.error("Error detail:", err.detail);
    console.error("Error message:", err.message);

    // Handle specific database errors
    let errorMessage = "Server error: " + err.message;
    if (err.code === '23505') { // Unique violation
      errorMessage = "Email already exists in the system";
    }
    if (err.code === '23502') { // Not null violation
      errorMessage = "Missing required field: " + err.detail;
    }

    res.status(500).json({ error: errorMessage, code: err.code, detail: err.detail });
  }
});

//UPDATE
router.put("/:employee_no", async (req, res) => {
  const { employee_no } = req.params;
  const { first_name, last_name, is_manager, email } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "Missing required fields: first_name, last_name, email" });
  }

  try {
    const result = await pool.query(
      `UPDATE employees
       SET first_name=$1, last_name=$2, is_manager=$3, email=$4
       WHERE employee_no=$5
       RETURNING *`,
      [first_name, last_name, is_manager || false, email, employee_no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(result.rows[0]);
    console.log(result.rows[0]);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Server error: " + err.message });
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

