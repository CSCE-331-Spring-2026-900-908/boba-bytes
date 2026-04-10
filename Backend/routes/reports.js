import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

const isValidDateString = (value) => {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const defaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const toDateString = (d) => d.toISOString().slice(0, 10);
  return {
    start_date: toDateString(start),
    end_date: toDateString(end)
  };
};

const normalizeRange = (req, res) => {
  const defaults = defaultDateRange();
  const start_date = req.query.start_date || defaults.start_date;
  const end_date = req.query.end_date || defaults.end_date;

  if (!isValidDateString(start_date) || !isValidDateString(end_date)) {
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    return null;
  }

  if (start_date > end_date) {
    res.status(400).json({ error: "start_date must be before or equal to end_date" });
    return null;
  }

  return { start_date, end_date };
};

router.get("/x", async (req, res) => {
  const requestedDate = req.query.date || new Date().toISOString().slice(0, 10);
  if (!isValidDateString(requestedDate)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  try {
    const summaryResult = await pool.query(
      `SELECT
          COUNT(*)::int AS order_count,
          COALESCE(SUM(order_total), 0)::float AS gross_sales,
          COALESCE(AVG(order_total), 0)::float AS avg_order_value,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'cash'), 0)::float AS cash_sales,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'card'), 0)::float AS card_sales,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'kiosk'), 0)::float AS kiosk_sales
       FROM orders
       WHERE timestamp >= $1::date
         AND timestamp < ($1::date + INTERVAL '1 day')`,
      [requestedDate]
    );

    const hourlyResult = await pool.query(
      `SELECT
          TO_CHAR(DATE_TRUNC('hour', o.timestamp), 'HH24:00') AS hour_label,
          COUNT(*)::int AS order_count,
          COALESCE(SUM(o.order_total), 0)::float AS gross_sales
       FROM orders o
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($1::date + INTERVAL '1 day')
       GROUP BY DATE_TRUNC('hour', o.timestamp)
       ORDER BY DATE_TRUNC('hour', o.timestamp)`,
      [requestedDate]
    );

    const topItemsResult = await pool.query(
      `SELECT
          m.menu_item_id,
          m.item_name,
          COALESCE(SUM(oi.quantity), 0)::float AS quantity_sold,
          COALESCE(SUM(oi.quantity * m.item_cost), 0)::float AS sales_amount
       FROM ordereditems oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN menu m ON m.menu_item_id = oi.menu_item_id
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($1::date + INTERVAL '1 day')
       GROUP BY m.menu_item_id, m.item_name
       ORDER BY quantity_sold DESC, sales_amount DESC
       LIMIT 10`,
      [requestedDate]
    );

    res.json({
      report_type: "x",
      date: requestedDate,
      summary: summaryResult.rows[0],
      hourly_sales: hourlyResult.rows,
      top_items: topItemsResult.rows
    });
  } catch (err) {
    console.error("GET /reports/x error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/z", async (req, res) => {
  const range = normalizeRange(req, res);
  if (!range) return;

  try {
    const summaryResult = await pool.query(
      `SELECT
          COUNT(*)::int AS order_count,
          COALESCE(SUM(order_total), 0)::float AS gross_sales,
          COALESCE(AVG(order_total), 0)::float AS avg_order_value,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'cash'), 0)::float AS cash_sales,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'card'), 0)::float AS card_sales,
          COALESCE(SUM(order_total) FILTER (WHERE payment_type = 'kiosk'), 0)::float AS kiosk_sales
       FROM orders
       WHERE timestamp >= $1::date
         AND timestamp < ($2::date + INTERVAL '1 day')`,
      [range.start_date, range.end_date]
    );

    const dailyResult = await pool.query(
      `SELECT
          DATE(o.timestamp) AS report_date,
          COUNT(*)::int AS order_count,
          COALESCE(SUM(o.order_total), 0)::float AS gross_sales
       FROM orders o
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($2::date + INTERVAL '1 day')
       GROUP BY DATE(o.timestamp)
       ORDER BY DATE(o.timestamp)`,
      [range.start_date, range.end_date]
    );

    const categoryResult = await pool.query(
      `SELECT
          COALESCE(m.item_type, 'Uncategorized') AS item_type,
          COALESCE(SUM(oi.quantity), 0)::float AS quantity_sold,
          COALESCE(SUM(oi.quantity * m.item_cost), 0)::float AS sales_amount
       FROM ordereditems oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN menu m ON m.menu_item_id = oi.menu_item_id
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($2::date + INTERVAL '1 day')
       GROUP BY COALESCE(m.item_type, 'Uncategorized')
       ORDER BY sales_amount DESC`,
      [range.start_date, range.end_date]
    );

    const topItemsResult = await pool.query(
      `SELECT
          m.menu_item_id,
          m.item_name,
          COALESCE(SUM(oi.quantity), 0)::float AS quantity_sold,
          COALESCE(SUM(oi.quantity * m.item_cost), 0)::float AS sales_amount
       FROM ordereditems oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN menu m ON m.menu_item_id = oi.menu_item_id
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($2::date + INTERVAL '1 day')
       GROUP BY m.menu_item_id, m.item_name
       ORDER BY quantity_sold DESC, sales_amount DESC
       LIMIT 10`,
      [range.start_date, range.end_date]
    );

    res.json({
      report_type: "z",
      start_date: range.start_date,
      end_date: range.end_date,
      summary: summaryResult.rows[0],
      daily_sales: dailyResult.rows,
      category_breakdown: categoryResult.rows,
      top_items: topItemsResult.rows
    });
  } catch (err) {
    console.error("GET /reports/z error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/product-usage", async (req, res) => {
  const range = normalizeRange(req, res);
  if (!range) return;

  try {
    const totalsResult = await pool.query(
      `SELECT
          i.inv_item_id,
          i.item_name,
          ri.unit_of_measure,
          COALESCE(SUM(oi.quantity * ri.quantity), 0)::float AS used_quantity
       FROM ordereditems oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN recipeitems ri ON ri.menu_item_id = oi.menu_item_id
       JOIN inventory i ON i.inv_item_id = ri.inv_item_id
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($2::date + INTERVAL '1 day')
       GROUP BY i.inv_item_id, i.item_name, ri.unit_of_measure
       ORDER BY used_quantity DESC, i.item_name ASC`,
      [range.start_date, range.end_date]
    );

    const byDayResult = await pool.query(
      `SELECT
          DATE(o.timestamp) AS usage_date,
          i.inv_item_id,
          i.item_name,
          ri.unit_of_measure,
          COALESCE(SUM(oi.quantity * ri.quantity), 0)::float AS used_quantity
       FROM ordereditems oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN recipeitems ri ON ri.menu_item_id = oi.menu_item_id
       JOIN inventory i ON i.inv_item_id = ri.inv_item_id
       WHERE o.timestamp >= $1::date
         AND o.timestamp < ($2::date + INTERVAL '1 day')
       GROUP BY DATE(o.timestamp), i.inv_item_id, i.item_name, ri.unit_of_measure
       ORDER BY DATE(o.timestamp), i.item_name ASC`,
      [range.start_date, range.end_date]
    );

    res.json({
      report_type: "product_usage",
      start_date: range.start_date,
      end_date: range.end_date,
      usage_totals: totalsResult.rows,
      usage_by_day: byDayResult.rows
    });
  } catch (err) {
    console.error("GET /reports/product-usage error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
