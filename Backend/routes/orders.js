import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Order received:", req.body);

  const { items, total, payment_type, order_source } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders (order_total, payment_type, order_source, timestamp)
      VALUES ($1, $2, $3, NOW() AT TIME ZONE 'America/Chicago')
      RETURNING order_id
      `,
      [
        total,
        payment_type || "cashier", // kiosk can override when calling same route
        order_source || "cashier",
      ]
    );

    const orderId = orderResult.rows[0].order_id;

    const insertItemText = `
      INSERT INTO ordereditems (order_id, menu_item_id, quantity)
      VALUES ($1, $2, $3)
    `;

    for (const item of items) {
      if (!item.menu_item_id || !item.quantity) continue;
      await client.query(insertItemText, [
        orderId,
        item.menu_item_id,
        item.quantity,
      ]);
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order error:", err.message);
    res.status(500).send("Server error");
  } finally {
    client.release();
  }
});

export default router;
