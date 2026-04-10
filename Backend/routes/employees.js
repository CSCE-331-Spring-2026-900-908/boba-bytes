import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                employee_no AS id,
                first_name || ' ' || last_name AS name,
                CASE WHEN is_manager THEN 'Manager' ELSE 'Employee' END AS role,
                TRUE AS active
            FROM employees
            ORDER BY employee_no;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

router.post("/", async (req, res) => {
    const { name, role } = req.body;

    try {
        // Split "John Doe" → ["John", "Doe"]
        const [first_name, last_name] = name.split(" ");

        const is_manager = role.toLowerCase() === "manager";

        // Auto-generate email + default password
        const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@example.com`;
        const defaultPasswordHash =
            "$2a$10$N9qo8ucoIsVlicLlT1wxO.O5DkJjUVuyxJ7FlqyhQeJ28zsSgQW3e"; // "password123"

        // Auto-generate next employee number
        const nextIdQuery = await pool.query(
            "SELECT COALESCE(MAX(employee_no), 0) + 1 AS next_id FROM employees"
        );
        const nextEmployeeNo = nextIdQuery.rows[0].next_id;

        await pool.query(
            `INSERT INTO employees 
            (employee_no, first_name, last_name, is_manager, email, password)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                nextEmployeeNo,
                first_name,
                last_name,
                is_manager,
                email,
                defaultPasswordHash,
            ]
        );

        res.json({ message: "Employee added" });
    } catch (err) {
        console.error("Error adding employee:", err);
        res.status(500).json({ error: "Failed to add employee" });
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // If you add an active column:
        // await pool.query("UPDATE employees SET active = FALSE WHERE employee_no = $1", [id]);

        // If you want to HARD DELETE instead:
        await pool.query("DELETE FROM employees WHERE employee_no = $1", [id]);

        res.json({ message: "Employee deactivated" });
    } catch (err) {
        console.error("Error deactivating employee:", err);
        res.status(500).json({ error: "Failed to deactivate employee" });
    }
});

export default router;

