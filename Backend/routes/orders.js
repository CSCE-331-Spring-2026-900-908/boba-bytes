import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: "No items in order" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (order_total, payment_type, timestamp)
       VALUES ($1, 'cashier', NOW() AT TIME ZONE 'America/Chicago')
       RETURNING order_id`,
      [total]
    );

    const orderId = orderRes.rows[0].order_id;

    for (const item of items) {
      await client.query(
        `INSERT INTO ordereditems (order_id, menu_item_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, item.menu_item_id, item.quantity]
      );

      if (item.toppings) {
        for (const t of item.toppings) {
          await client.query(
            `INSERT INTO ordereditems (order_id, menu_item_id, quantity)
             VALUES ($1, $2, $3)`,
            [orderId, t.topping_id, t.quantity ?? item.quantity ?? 1]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    client.release();
  }
});

export default router;

