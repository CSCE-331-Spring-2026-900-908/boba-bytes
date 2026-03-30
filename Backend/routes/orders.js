import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const orderResult = await client.query(
            "INSERT INTO orders (order_total, payment_type, timestamp) VALUES ($1, $2, NOW()) RETURNING order_id",
            [total, "cash"]
        );
        const orderId = orderResult.rows[0].order_id;

        for (const item of items) {
            await client.query(
                "INSERT INTO ordereditems (order_id, menu_item_id, quantity) VALUES ($1, $2, $3)",
                [orderId, item.id, item.qty]
            );
        }

        await client.query("COMMIT");
        res.json({ order_id: orderId });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Order failed:", err);
        res.status(500).json({ error: "Failed to place order" });
    } finally {
        client.release();
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY timestamp DESC LIMIT 50"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

export default router;
