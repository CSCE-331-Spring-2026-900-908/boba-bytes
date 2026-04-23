import express from "express";
import { placeOrderWithInventory } from "../services/orderPlacement.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { items, total } = req.body;
  try {
    const paymentType = req.body?.payment_type === "kiosk" ? "kiosk" : "cashier";
    const result = await placeOrderWithInventory({ items, total, paymentType });
    res.json({ success: true, order_id: result.order_id });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, detail: err.detail ?? null });
    }

    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


