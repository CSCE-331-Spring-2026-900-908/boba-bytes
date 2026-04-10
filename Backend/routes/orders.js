// routes/ordersRoutes.js
import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

/**
 * Expected body:
 * {
 *   items: [
 *     {
 *       menu_item_id: number,
 *       quantity: number,
 *       toppings?: [
 *         { topping_id: number, quantity: number }
 *       ]
 *     }
 *   ],
 *   total: number,
 *   payment_type?: string,   // 'cash', 'card', 'kiosk', etc.
 *   order_source?: string    // 'cashier' | 'kiosk' | 'online' | 'phone'
 * }
 */
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
        payment_type || "cashier",
        order_source || "cashier",
      ]
    );

    const orderId = orderResult.rows[0].order_id;

    const insertItemText = `
      INSERT INTO ordereditems (order_id, menu_item_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const insertToppingText = `
      INSERT INTO ordereditem_toppings (ordereditem_id, topping_id, quantity)
      VALUES ($1, $2, $3)
    `;

    for (const item of items) {
      if (!item.menu_item_id || !item.quantity) continue;

      const orderedItemResult = await client.query(insertItemText, [
        orderId,
        item.menu_item_id,
        item.quantity,
      ]);

      const orderedItemId = orderedItemResult.rows[0].id;

      if (Array.isArray(item.toppings)) {
        for (const t of item.toppings) {
          if (!t.topping_id || !t.quantity) continue;
          await client.query(insertToppingText, [
            orderedItemId,
            t.topping_id,
            t.quantity,
          ]);
        }
      }
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
