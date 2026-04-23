import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../../config/api.js";

const todayString = () => new Date().toISOString().slice(0, 10);

const parseJsonSafe = async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

function Reports() {
    const [reportType, setReportType] = useState("order_history");
    const [date, setDate] = useState(todayString());
    const [startDate, setStartDate] = useState(todayString());
    const [endDate, setEndDate] = useState(todayString());
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [zStatus, setZStatus] = useState({
        isGeneratedToday: false,
        reportDate: todayString(),
        generatedAt: null
    });

    const usageMax = useMemo(() => {
        if (reportType !== "product_usage" || !reportData?.usage_totals?.length) return 0;
        return Math.max(...reportData.usage_totals.map((row) => Number(row.used_quantity || 0)));
    }, [reportData, reportType]);

    useEffect(() => {
        const fetchZStatus = async () => {
            try {
                const response = await fetch(`${API_BASE}/reports/z/status`);
                const data = await parseJsonSafe(response);
                if (!response.ok) return;

                setZStatus({
                    isGeneratedToday: Boolean(data?.is_generated_today),
                    reportDate: data?.report_date || todayString(),
                    generatedAt: data?.generated_at || null
                });
            } catch {
                // Keep UI usable even if status lookup fails.
            }
        };

        fetchZStatus();
    }, []);

    useEffect(() => {
        // Load order history by default on mount
        const loadDefaultReport = async () => {
            setIsLoading(true);
            setError("");
            try {
                const endpoint = `${API_BASE}/reports/order-history`;
                const response = await fetch(endpoint);
                const data = await parseJsonSafe(response);
                if (!response.ok) {
                    throw new Error(data?.error || "Failed to generate report.");
                }
                setReportData(data);
            } catch (err) {
                setReportData(null);
                setError(err.message || "Failed to generate report.");
            } finally {
                setIsLoading(false);
            }
        };
        if (reportData === null) {
            loadDefaultReport();
        }
    }, []);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError("");

        try {
            let endpoint = "";
            if (reportType === "x") {
                endpoint = `${API_BASE}/reports/x?date=${encodeURIComponent(date)}`;
            } else if (reportType === "z") {
                endpoint = `${API_BASE}/reports/z`;
            } else if (reportType === "product_usage") {
                endpoint = `${API_BASE}/reports/product-usage?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
            } else if (reportType === "order_history") {
                endpoint = `${API_BASE}/reports/order-history`;
            }

            const response = await fetch(endpoint, {
                method: reportType === "z" ? "POST" : "GET"
            });
            const data = await parseJsonSafe(response);

            if (!response.ok) {
                throw new Error(data?.error || "Failed to generate report.");
            }

            setReportData(data);
            if (reportType === "z") {
                setZStatus({
                    isGeneratedToday: true,
                    reportDate: data?.date || zStatus.reportDate,
                    generatedAt: data?.generated_at || new Date().toISOString()
                });
            }
        } catch (err) {
            setReportData(null);
            setError(err.message || "Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    };

    const isZLocked = reportType === "z" && zStatus.isGeneratedToday;

    return (
        <div className="emp-management">
            <div className="emp-header">
                <h2>Reports</h2>
                <button className="btn-add" type="button" onClick={handleGenerateReport} disabled={isLoading || isZLocked}>
                    {isLoading ? "Generating..." : "Generate Report"}
                </button>
            </div>

            <div className="report-controls">
                <div className="reportDetail flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <label htmlFor="reportType" className="font-semibold text-slate-600 whitespace-nowrap">
                        Type:
                    </label>
                    <select
                        id="reportType"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="min-w-0 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="order_history">Order History</option>
                        <option value="x">X Report (Daily)</option>
                        <option value="z">Z Report (End of Day)</option>
                        <option value="product_usage">Product Usage</option>
                    </select>
                </div>

                {(reportType === "x") ? (
                    <div className="reportDetail flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <label htmlFor="reportDate" className="font-semibold text-slate-600 whitespace-nowrap">Date:</label>
                        <input
                            id="reportDate"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                ) : reportType === "product_usage" ? (
                    <div className="reportDetail flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <label htmlFor="reportStartDate" className="font-semibold text-slate-600 whitespace-nowrap">Start:</label>
                        <input
                            id="reportStartDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <label htmlFor="reportEndDate" className="font-semibold text-slate-600 whitespace-nowrap">End:</label>
                        <input
                            id="reportEndDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                ) : reportType === "z" ? (
                    <div className="reportDetail rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm text-sm text-slate-700">
                        <p>
                            Z report closes out <span className="font-semibold">{zStatus.reportDate}</span>. It can be generated only once per day.
                        </p>
                        {zStatus.isGeneratedToday && (
                            <p className="mt-1 text-amber-700">
                                Today&apos;s Z report is already generated{zStatus.generatedAt ? ` at ${new Date(zStatus.generatedAt).toLocaleTimeString()}` : ""}.
                            </p>
                        )}
                    </div>
                ) : null}
            </div>

            {error && <p className="report-error">{error}</p>}

            {reportData && reportType === "order_history" && (
                <>
                    <div className="report-section">
                        <h3>Recent Order History</h3>
                        <div className="report-summary-grid">
                            <div className="report-card">
                                <span>Total Orders Shown</span>
                                <strong>{reportData.total_orders || 0}</strong>
                            </div>
                            <div className="report-card">
                                <span>Total Sales</span>
                                <strong>{formatCurrency(reportData.grand_total)}</strong>
                            </div>
                        </div>
                    </div>

                    {reportData.orders && reportData.orders.length > 0 ? (
                        <div className="report-section">
                            <h3>Orders</h3>
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Time</th>
                                        <th>Items</th>
                                        <th>Payment</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td>#{order.order_id}</td>
                                            <td>{new Date(order.timestamp).toLocaleString()}</td>
                                            <td>
                                                <div className="text-sm">
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item, idx) => (
                                                            <div key={idx} className="text-slate-700">
                                                                {item.quantity}x {item.item_name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-500">No items</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="capitalize">{order.payment_type}</td>
                                            <td>{formatCurrency(order.order_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="report-section">
                            <p className="empty-row">No orders found for selected date.</p>
                        </div>
                    )}
                </>
            )}

            {reportData && (reportType === "x" || reportType === "z") && (
                <>
                    <div className="report-summary-grid">
                        <div className="report-card">
                            <span>Total Sales</span>
                            <strong>{formatCurrency(reportData.summary?.gross_sales)}</strong>
                        </div>
                        <div className="report-card">
                            <span>Orders</span>
                            <strong>{Number(reportData.summary?.order_count || 0)}</strong>
                        </div>
                        <div className="report-card">
                            <span>Average Ticket</span>
                            <strong>{formatCurrency(reportData.summary?.avg_order_value)}</strong>
                        </div>
                        <div className="report-card">
                            <span>Cash / Card / Kiosk</span>
                            <strong>
                                {formatCurrency(reportData.summary?.cash_sales)} / {formatCurrency(reportData.summary?.card_sales)} / {formatCurrency(reportData.summary?.kiosk_sales)}
                            </strong>
                        </div>
                    </div>

                    <div className="report-section">
                        <h3>{reportType === "x" ? "Top Items (Day)" : "Top Items (Range)"}</h3>
                        <table className="emp-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty Sold</th>
                                    <th>Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.top_items?.map((item) => (
                                    <tr key={item.menu_item_id}>
                                        <td>{item.item_name}</td>
                                        <td>{Number(item.quantity_sold).toFixed(2)}</td>
                                        <td>{formatCurrency(item.sales_amount)}</td>
                                    </tr>
                                ))}
                                {(!reportData.top_items || reportData.top_items.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="empty-row">No sales data for selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {reportType === "x" && (
                        <div className="report-section">
                            <h3>Hourly Sales</h3>
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>Hour</th>
                                        <th>Orders</th>
                                        <th>Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.hourly_sales?.map((row) => (
                                        <tr key={row.hour_label}>
                                            <td>{row.hour_label}</td>
                                            <td>{row.order_count}</td>
                                            <td>{formatCurrency(row.gross_sales)}</td>
                                        </tr>
                                    ))}
                                    {(!reportData.hourly_sales || reportData.hourly_sales.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="empty-row">No hourly data for selected date.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {reportType === "z" && (
                        <div className="report-section">
                            <h3>Category Breakdown</h3>
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Qty Sold</th>
                                        <th>Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.category_breakdown?.map((row) => (
                                        <tr key={row.item_type}>
                                            <td>{row.item_type}</td>
                                            <td>{Number(row.quantity_sold).toFixed(2)}</td>
                                            <td>{formatCurrency(row.sales_amount)}</td>
                                        </tr>
                                    ))}
                                    {(!reportData.category_breakdown || reportData.category_breakdown.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="empty-row">No category data for selected range.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {reportData && reportType === "product_usage" && (
                <>
                    <div className="report-section">
                        <h3>Product Usage Chart</h3>
                        <div className="usage-chart">
                            {reportData.usage_totals?.map((row) => {
                                const used = Number(row.used_quantity || 0);
                                const widthPercent = usageMax > 0 ? Math.max((used / usageMax) * 100, 2) : 0;
                                return (
                                    <div className="usage-row" key={row.inv_item_id}>
                                        <div className="usage-label">{row.item_name}</div>
                                        <div className="usage-bar-wrap">
                                            <div className="usage-bar" style={{ width: `${widthPercent}%` }} />
                                        </div>
                                        <div className="usage-value">{used.toFixed(2)} {row.unit_of_measure}</div>
                                    </div>
                                );
                            })}
                            {(!reportData.usage_totals || reportData.usage_totals.length === 0) && (
                                <p className="empty-row">No product usage for selected range.</p>
                            )}
                        </div>
                    </div>

                    <div className="report-section">
                        <h3>Usage by Day</h3>
                        <table className="emp-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Ingredient</th>
                                    <th>Used</th>
                                    <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.usage_by_day?.map((row, idx) => (
                                    <tr key={`${row.usage_date}-${row.inv_item_id}-${idx}`}>
                                        <td>{String(row.usage_date).slice(0, 10)}</td>
                                        <td>{row.item_name}</td>
                                        <td>{Number(row.used_quantity).toFixed(2)}</td>
                                        <td>{row.unit_of_measure}</td>
                                    </tr>
                                ))}
                                {(!reportData.usage_by_day || reportData.usage_by_day.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="empty-row">No usage-by-day data for selected range.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default Reports;

