// src/pages/Cashier/CashierPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./Cashier.css";
import { API_BASE } from "../../config/api.js";

export default function CashierPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);

  const [activeTab, setActiveTab] = useState("categories"); // "categories" | "favorites"
  const [activeCategory, setActiveCategory] = useState(null);

  const [order, setOrder] = useState([]); // [{ menu_item_id, item_name, item_cost, qty, toppings: [] }]
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [toppingModal, setToppingModal] = useState({
    open: false,
    baseItem: null,
  });

  // Load menu, categories, toppings
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/menu/items`).then((r) => r.json()),
      fetch(`${API_BASE}/menu/categories`).then((r) => r.json()),
      fetch(`${API_BASE}/menu/toppings`).then((r) => r.json()).catch(() => []),
    ])
      .then(([itemData, catData, toppingData]) => {
        setItems(itemData);
        setCategories(catData);
        setToppings(toppingData || []);
        if (catData.length > 0) setActiveCategory(catData[0]);
      })
      .catch((err) => console.error("Failed to load menu:", err))
      .finally(() => setLoading(false));
  }, []);

  // Compute favorites from current order usage
  useEffect(() => {
    const counts = new Map();
    order.forEach((o) => {
      counts.set(o.menu_item_id, (counts.get(o.menu_item_id) || 0) + o.qty);
    });
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
    setFavorites(sorted);
  }, [order]);

  const filteredItems = useMemo(() => {
    let list = items;

    if (activeTab === "categories" && activeCategory) {
      list = list.filter((i) => i.item_type === activeCategory);
    }

    if (activeTab === "favorites") {
      list = list.filter((i) => favorites.includes(i.menu_item_id));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((i) => i.item_name.toLowerCase().includes(q));
    }

    return list;
  }, [items, activeCategory, activeTab, favorites, searchTerm]);

  const orderTotal = useMemo(() => {
    return order.reduce((sum, o) => {
      const base = Number(o.item_cost) * o.qty;
      const toppingsTotal = o.toppings.reduce(
        (tSum, t) => tSum + Number(t.topping_cost) * o.qty,
        0
      );
      return sum + base + toppingsTotal;
    }, 0);
  }, [order]);

  function openToppingModal(item) {
    setToppingModal({ open: true, baseItem: item });
  }

  function addItemWithToppings(baseItem, selectedToppings) {
    setOrder((prev) => [
      ...prev,
      {
        menu_item_id: baseItem.menu_item_id,
        item_name: baseItem.item_name,
        item_cost: baseItem.item_cost,
        qty: 1,
        toppings: selectedToppings,
      },
    ]);
  }

  function changeQty(index, delta) {
    setOrder((prev) =>
      prev
        .map((o, i) =>
          i === index ? { ...o, qty: o.qty + delta } : o
        )
        .filter((o) => o.qty > 0)
    );
  }

  function removeItem(index) {
    setOrder((prev) => prev.filter((_, i) => i !== index));
  }

  function clearOrder() {
    setOrder([]);
  }

  async function placeOrder() {
    if (order.length === 0) return;
    setPlacing(true);

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order.map((o) => ({
            menu_item_id: o.menu_item_id,
            quantity: o.qty,
            toppings: o.toppings.map((t) => ({
              topping_id: t.topping_id,
              quantity: 1,
            })),
          })),
          total: orderTotal,
          payment_type: "cashier",
          order_source: "cashier",
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      alert(`Order #${data.order_id} placed! Total: $${orderTotal.toFixed(2)}`);
      clearOrder();
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="cashier-container loading-center">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="cashier-container">
      {/* Sidebar */}
      <div className="cashier-sidebar">
        <h2>Menu</h2>

        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>

        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites ⭐
        </button>

        {activeTab === "categories" &&
          categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
      </div>

      {/* Center */}
      <div className="cashier-content">
        <div className="cashier-content-header">
          <input
            className="cashier-search"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <button
              key={item.menu_item_id}
              onClick={() => openToppingModal(item)}
            >
              <div className="item-name">{item.item_name}</div>
              <div className="item-price">
                ${Number(item.item_cost).toFixed(2)}
              </div>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="empty-msg">No items found.</p>
          )}
        </div>
      </div>

      {/* Order Panel */}
      <div className="order-panel">
        <div className="order-header">Current Order</div>

        <div className="order-items">
          {order.length === 0 && (
            <p className="empty-order">No items yet.</p>
          )}

          {order.map((o, index) => (
            <div key={index} className="order-row">
              <div className="order-item-info">
                <div className="order-item-name">{o.item_name}</div>

                {o.toppings.length > 0 && (
                  <div className="order-toppings">
                    {o.toppings.map((t) => (
                      <div
                        key={t.topping_id}
                        className="topping-line"
                      >
                        + {t.topping_name} (${t.topping_cost})
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-item-price">
                  ${(Number(o.item_cost) * o.qty +
                    o.toppings.reduce(
                      (s, t) => s + Number(t.topping_cost) * o.qty,
                      0
                    )
                  ).toFixed(2)}
                </div>
              </div>

              <div className="order-item-controls">
                <button onClick={() => changeQty(index, -1)}>-</button>
                <span className="qty">{o.qty}</span>
                <button onClick={() => changeQty(index, +1)}>+</button>
                <button onClick={() => removeItem(index)}>×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="order-footer">
          <div className="order-total">
            <span>Total</span>
            <span className="total-amount">
              ${orderTotal.toFixed(2)}
            </span>
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

      {toppingModal.open && (
        <ToppingModal
          baseItem={toppingModal.baseItem}
          toppings={toppings}
          onClose={() =>
            setToppingModal({ open: false, baseItem: null })
          }
          onSubmit={addItemWithToppings}
        />
      )}
    </div>
  );
}

function ToppingModal({ baseItem, toppings, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);

  function toggleTopping(t) {
    setSelected((prev) =>
      prev.some((p) => p.topping_id === t.topping_id)
        ? prev.filter((p) => p.topping_id !== t.topping_id)
        : [...prev, t]
    );
  }

  return (
    <div className="topping-modal-backdrop" onClick={onClose}>
      <div className="topping-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add toppings for {baseItem.item_name}</h3>

        <div className="topping-list">
          {toppings.map((t) => (
            <button
              key={t.topping_id}
              className={
                selected.some((p) => p.topping_id === t.topping_id)
                  ? "topping-btn active"
                  : "topping-btn"
              }
              onClick={() => toggleTopping(t)}
            >
              {t.topping_name} (+${Number(t.topping_cost).toFixed(2)})
            </button>
          ))}
          {toppings.length === 0 && (
            <p className="no-toppings">No toppings configured.</p>
          )}
        </div>

        <div className="topping-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="add-btn"
            onClick={() => {
              onSubmit(baseItem, selected);
              onClose();
            }}
          >
            Add Drink
          </button>
        </div>
      </div>
    </div>
  );
}
