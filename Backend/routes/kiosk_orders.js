import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.post("/", async (req, res) => {
    console.log("Order received:", req.body);
    const { items, total } = req.body;
    try {
        const orderResult = await pool.query(
            `INSERT INTO orders (order_total, payment_type, timestamp)
             VALUES ($1, $2, NOW() AT TIME ZONE 'America/Chicago') RETURNING order_id`,
            [total, "kiosk"]
        );
        const orderId = orderResult.rows[0].order_id;

        for (const item of items) {
            await pool.query(
                `INSERT INTO ordereditems (order_id, menu_item_id, quantity)
                 VALUES ($1, $2, $3)`,
                [orderId, item.menu_item_id, item.quantity]
            );
        }

        res.status(201).json({ success: true, order_id: orderId });
    } catch (err) {
        console.error("Order error:", err.message); // add this
        res.status(500).send("Server error");
    }
});

export default router;