import React, { useState, useEffect, useMemo } from "react";
import "./Cashier.css";
import { API_BASE } from "../../config/api.js";

export default function CashierPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategory, setActiveCategory] = useState("Favorites");
  const [order, setOrder] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [placing, setPlacing] = useState(false);

  // Load menu + categories
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/menu/items`).then(r => r.json()),
      fetch(`${API_BASE}/menu/categories`).then(r => r.json())
    ])
      .then(([itemData, catData]) => {
        setItems(itemData);
        setCategories(["Favorites", ...catData]); // Favorites is now a category
      })
      .catch(err => console.error(err));
  }, []);

  // Compute favorites (top 8 + seasonal)
  useEffect(() => {
    const counts = new Map();
    order.forEach(o => {
      counts.set(o.menu_item_id, (counts.get(o.menu_item_id) || 0) + o.qty);
    });

    const topUsed = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    const seasonal = items
      .filter(i => i.item_type.toLowerCase().includes("season"))
      .map(i => i.menu_item_id);

    setFavoriteIds([...new Set([...topUsed, ...seasonal])]);
  }, [order, items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    let list = items;

    if (activeCategory === "Favorites") {
      list = list.filter(i => favoriteIds.includes(i.menu_item_id));
    } else {
      list = list.filter(i => i.item_type === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(i => i.item_name.toLowerCase().includes(q));
    }

    return list;
  }, [items, activeCategory, favoriteIds, searchTerm]);

  // Add drink
  function addDrink(item) {
    setOrder(prev => [
      ...prev,
      {
        menu_item_id: item.menu_item_id,
        item_name: item.item_name,
        item_cost: item.item_cost,
        qty: 1,
        toppings: []
      }
    ]);
  }

  // Add topping to last drink
  function addTopping(item) {
    setOrder(prev => {
      if (prev.length === 0) {
        alert("Add a drink first");
        return prev;
      }

      const lastIndex = prev.length - 1;
      const last = prev[lastIndex];

      const updated = {
        ...last,
        toppings: [...last.toppings, item]
      };

      const copy = [...prev];
      copy[lastIndex] = updated;
      return copy;
    });
  }

  // Add item (drink or topping)
  function handleAdd(item) {
    if (item.item_type === "Toppings") {
      addTopping(item);
    } else {
      addDrink(item);
    }
  }

  // Change qty
  function changeQty(index, delta) {
    setOrder(prev =>
      prev
        .map((o, i) => (i === index ? { ...o, qty: o.qty + delta } : o))
        .filter(o => o.qty > 0)
    );
  }

  // Remove drink (and its toppings)
  function removeItem(index) {
    setOrder(prev => prev.filter((_, i) => i !== index));
  }

  const orderTotal = useMemo(() => {
    return order.reduce((sum, o) => {
      const base = o.item_cost * o.qty;
      const toppingTotal = o.toppings.reduce(
        (s, t) => s + t.item_cost * o.qty,
        0
      );
      return sum + base + toppingTotal;
    }, 0);
  }, [order]);

  async function placeOrder() {
    if (order.length === 0) return;

    setPlacing(true);

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: order.map(o => ({
            menu_item_id: o.menu_item_id,
            quantity: o.qty,
            toppings: o.toppings.map(t => ({
              topping_id: t.menu_item_id,
              quantity: 1
            }))
          })),
          total: orderTotal
        })
      });

      const data = await res.json();
      alert(`Order #${data.order_id} placed!`);
      setOrder([]);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="cashier-container">
      {/* Sidebar */}
      <div className="cashier-sidebar">
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu */}
      <div className="cashier-content">
        <input
          className="cashier-search"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="menu-grid">
          {filteredItems.map(item => (
            <button
              key={item.menu_item_id}
              onClick={() => handleAdd(item)}
            >
              <div className="item-name">{item.item_name}</div>
              <div className="item-price">
                ${Number(item.item_cost).toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Order Panel */}
      <div className="order-panel">
        <div className="order-header">Current Order</div>

        <div className="order-items">
          {order.map((o, index) => (
            <div key={index} className="order-row">
              <div className="order-item-info">
                <div className="order-item-name">{o.item_name}</div>

                {o.toppings.length > 0 && (
                  <div className="order-toppings">
                    {o.toppings.map((t, i) => (
                      <div key={i} className="topping-line">
                        + {t.item_name} (${t.item_cost})
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-item-price">
                  ${(o.item_cost * o.qty +
                    o.toppings.reduce(
                      (s, t) => s + t.item_cost * o.qty,
                      0
                    )).toFixed(2)}
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
            <span className="total-amount">${orderTotal.toFixed(2)}</span>
          </div>

          <button
            className="place-btn"
            disabled={placing || order.length === 0}
            onClick={placeOrder}
          >
            {placing ? "Placing..." : "Place Order"}
          </button>

          <button className="clear-btn" onClick={() => setOrder([])}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
