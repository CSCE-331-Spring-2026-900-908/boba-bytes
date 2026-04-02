import React, { useState, useEffect } from "react";
import "./Cashier.css";

export default function CashierPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("https://boba-bytes.onrender.com/api/menu/items").then((r) => r.json()),
            fetch("https://boba-bytes.onrender.com/api/menu/categories").then((r) => r.json()),
        ])
            .then(([itemData, catData]) => {
                setItems(itemData);
                setCategories(catData);
                if (catData.length > 0) setActiveCategory(catData[0]);
            })
            .catch((err) => console.error("Failed to load menu:", err))
            .finally(() => setLoading(false));
    }, []);

    const filteredItems = items.filter((i) => i.item_type === activeCategory);

    function addItem(item) {
        setOrder((prev) => {
            const existing = prev.find((o) => o.menu_item_id === item.menu_item_id);
            if (existing) {
                return prev.map((o) =>
                    o.menu_item_id === item.menu_item_id ? { ...o, qty: o.qty + 1 } : o
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }

    function removeItem(id) {
        setOrder((prev) =>
            prev
                .map((o) => (o.menu_item_id === id ? { ...o, qty: o.qty - 1 } : o))
                .filter((o) => o.qty > 0)
        );
    }

    function clearOrder() {
        setOrder([]);
    }

    async function placeOrder() {
        if (order.length === 0) return;
        setPlacing(true);
        try {
            const res = await fetch("https://boba-bytes.onrender.com/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: order.map((o) => ({ id: o.menu_item_id, qty: o.qty })),
                    total: orderTotal,
                }),
            });
            if (!res.ok) throw new Error("Server error");
            const data = await res.json();
            alert(`Order #${data.order_id} placed! Total: $${orderTotal.toFixed(2)}`);
            setOrder([]);
        } catch (err) {
            console.error(err);
            alert("Failed to place order. Please try again.");
        } finally {
            setPlacing(false);
        }
    }

    const orderTotal = order.reduce((sum, o) => sum + o.item_cost * o.qty, 0);

    if (loading) {
        return (
            <div className="cashier-container" style={{ alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 20, color: "#888" }}>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="cashier-container">
            {/* Sidebar — categories */}
            <div className="cashier-sidebar">
                <h2>Categories</h2>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={activeCategory === cat ? "active" : ""}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Center — menu items */}
            <div className="cashier-content">
                <h2>{activeCategory || "Menu"}</h2>
                <div className="menu-grid">
                    {filteredItems.map((item) => (
                        <button key={item.menu_item_id} onClick={() => addItem(item)}>
                            <div className="item-name">{item.item_name}</div>
                            <div className="item-price">${Number(item.item_cost).toFixed(2)}</div>
                        </button>
                    ))}
                    {filteredItems.length === 0 && (
                        <p className="empty-msg">No items in this category.</p>
                    )}
                </div>
            </div>

            {/* Right — order panel */}
            <div className="order-panel">
                <div className="order-header">Current Order</div>

                <div className="order-items">
                    {order.length === 0 && (
                        <p className="empty-order">No items yet.</p>
                    )}
                    {order.map((o) => (
                        <div key={o.menu_item_id} className="order-row">
                            <div className="order-item-info">
                                <div className="order-item-name">{o.item_name}</div>
                                <div className="order-item-price">
                                    ${Number(o.item_cost).toFixed(2)} each
                                </div>
                            </div>
                            <div className="order-item-controls">
                                <button className="btn-minus" onClick={() => removeItem(o.menu_item_id)}>−</button>
                                <span className="qty">{o.qty}</span>
                                <button className="btn-plus" onClick={() => addItem(o)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="order-footer">
                    <div className="order-total">
                        <span>Total</span>
                        <span className="total-amount">${orderTotal.toFixed(2)}</span>
                    </div>
                    <button
                        className="place-btn"
                        onClick={placeOrder}
                        disabled={order.length === 0 || placing}
                    >
                        {placing ? "Placing..." : "Place Order"}
                    </button>
                    <button className="clear-btn" onClick={clearOrder}>
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}