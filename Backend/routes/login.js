import express from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";

const router = express.Router();

router.post("/cashier", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT first_name, last_name, password FROM employees WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({ success: false });
        }

        const user = result.rows[0];
        const storedPassword = user.password;

        let isMatch = false;

        const isBCryptHash = storedPassword.startsWith("$2") && storedPassword.length === 60;

        if (isBCryptHash) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            isMatch = password === storedPassword;
        }

        if (!isMatch) {
            return res.json({ success: false });
        }

        return res.json({ success: true, first_name: user.first_name, last_name: user.last_name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

export default router;