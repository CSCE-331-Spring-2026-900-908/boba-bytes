import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM reports");
    res.json(result.rows);
});

export default router;
