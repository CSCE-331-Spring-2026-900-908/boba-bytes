import React, { useState, useEffect, useMemo } from "react";
import "./Cashier.css";
import { API_BASE } from "../../config/api.js";

function createNewOrder(label = "Walk-in") {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label,
    source: "cashier",
    status: "open",
    items: [], 
  };
}

export default function CashierPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [orders, setOrders] = useState([createNewOrder()]);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]); 
  const [quantityPad, setQuantityPad] = useState({
    open: false,
    item: null,
  });

  useEffect(() => {
    if (orders.length > 0 && !activeOrderId) {
      setActiveOrderId(orders[0].id);
    }
  }, [orders, activeOrderId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/menu/items`).then((r) => r.json()),
      fetch(`${API_BASE}/menu/categories`).then((r) => r.json()),
    ])
      .then(([itemData, catData]) => {
        setItems(itemData);
        setCategories(catData);
        if (catData.length > 0) setActiveCategory(catData[0]);
      })
      .catch((err) => console.error("Failed to load menu:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId) || orders[0],
    [orders, activeOrderId]
  );

  const orderTotal = useMemo(() => {
    if (!activeOrder) return 0;
    return activeOrder.items.reduce(
      (sum, o) => sum + Number(o.item_cost) * o.qty,
      0
    );
  }, [activeOrder]);

  useEffect(() => {
    const counts = new Map();
    orders.forEach((ord) => {
      ord.items.forEach((it) => {
        counts.set(it.menu_item_id, (counts.get(it.menu_item_id) || 0) + it.qty);
      });
    });
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
    setFavorites(sorted);
  }, [orders]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeCategory) {
      list = list.filter((i) => i.item_type === activeCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((i) => i.item_name.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeCategory, searchTerm]);

  function updateActiveOrder(updater) {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === activeOrder.id ? { ...ord, ...updater(ord) } : ord
      )
    );
  }

  function addItemToActiveOrder(item, qty = 1) {
    if (!activeOrder) return;
    updateActiveOrder((ord) => {
      const existing = ord.items.find(
        (o) => o.menu_item_id === item.menu_item_id
      );
      if (existing) {
        return {
          items: ord.items.map((o) =>
            o.menu_item_id === item.menu_item_id
              ? { ...o, qty: o.qty + qty }
              : o
          ),
        };
      }
      return {
        items: [
          ...ord.items,
          {
            menu_item_id: item.menu_item_id,
            item_name: item.item_name,
            item_cost: item.item_cost,
            qty,
          },
        ],
      };
    });
  }

  function changeItemQty(id, delta) {
    if (!activeOrder) return;
    updateActiveOrder((ord) => {
      const updated = ord.items
        .map((o) =>
          o.menu_item_id === id ? { ...o, qty: o.qty + delta } : o
        )
        .filter((o) => o.qty > 0);
      return { items: updated };
    });
  }

  function removeItem(id) {
    if (!activeOrder) return;
    updateActiveOrder((ord) => ({
      items: ord.items.filter((o) => o.menu_item_id !== id),
    }));
  }

  function clearActiveOrder() {
    if (!activeOrder) return;
    updateActiveOrder(() => ({ items: [] }));
  }

  function newOrder(label = "Walk-in") {
    const ord = createNewOrder(label);
    setOrders((prev) => [...prev, ord]);
    setActiveOrderId(ord.id);
  }

  function holdOrder(id) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "held" } : o
      )
    );
  }

  function closeOrder(id) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (activeOrderId === id && prev.length > 1) {
      setActiveOrderId(prev[0].id);
    }
  }

  async function placeOrder() {
    if (!activeOrder || activeOrder.items.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: activeOrder.items.map((o) => ({
            menu_item_id: o.menu_item_id,
            quantity: o.qty,
          })),
          total: orderTotal,
          payment_type: "cashier",
          order_source: "cashier",
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      alert(
        `Order #${data.order_id} placed! Total: $${orderTotal.toFixed(2)}`
      );
     

      closeOrder(activeOrder.id);
      newOrder("Walk-in");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function openQuantityPad(item) {
    setQuantityPad({ open: true, item });
  }

  function applyQuantityPad(qty) {
    if (!quantityPad.item || qty <= 0) {
      setQuantityPad({ open: false, item: null });
      return;
    }
    addItemToActiveOrder(quantityPad.item, qty);
    setQuantityPad({ open: false, item: null });
  }

  if (loading) {
    return (
      <div
        className="cashier-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ fontSize: 20, color: "#888" }}>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="cashier-container">
      <div className="cashier-queue">
        <h2>Orders</h2>
        <button className="queue-new-btn" onClick={() => newOrder("Walk-in")}>
          + New Order
        </button>
        <div className="queue-list">
          {orders.map((ord) => (
            <button
              key={ord.id}
              className={
                "queue-item" + (ord.id === activeOrder.id ? " active" : "")
              }
              onClick={() => setActiveOrderId(ord.id)}
            >
              <div className="queue-label">{ord.label}</div>
              <div className="queue-meta">
                {ord.status === "held" ? "Held" : "Open"} •{" "}
                {ord.items.reduce((s, i) => s + i.qty, 0)} items
              </div>
            </button>
          ))}
        </div>
      </div>

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

      <div className="cashier-content">
        <div className="cashier-content-header">
          <h2>{activeCategory || "Menu"}</h2>
          <input
            className="cashier-search"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {favorites.length > 0 && (
          <div className="favorites-row">
            <div className="favorites-title">Quick Picks</div>
            <div className="favorites-items">
              {items
                .filter((i) => favorites.includes(i.menu_item_id))
                .map((item) => (
                  <button
                    key={item.menu_item_id}
                    className="favorite-btn"
                    onClick={() => addItemToActiveOrder(item, 1)}
                    onDoubleClick={() => addItemToActiveOrder(item, 2)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openQuantityPad(item);
                    }}
                  >
                    <div className="item-name">{item.item_name}</div>
                    <div className="item-price">
                      ${Number(item.item_cost).toFixed(2)}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <button
              key={item.menu_item_id}
              onClick={() => addItemToActiveOrder(item, 1)}
              onDoubleClick={() => addItemToActiveOrder(item, 2)}
              onContextMenu={(e) => {
                e.preventDefault();
                openQuantityPad(item);
              }}
            >
              <div className="item-name">{item.item_name}</div>
              <div className="item-price">
                ${Number(item.item_cost).toFixed(2)}
              </div>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="empty-msg">No items in this category.</p>
          )}
        </div>
      </div>

      <div className="order-panel">
        <div className="order-header">
          Current Order
          {activeOrder && (
            <span className="order-header-meta">
              {" "}
              • {activeOrder.label} •{" "}
              {activeOrder.items.reduce((s, i) => s + i.qty, 0)} items
            </span>
          )}
        </div>
        <div className="order-items">
          {(!activeOrder || activeOrder.items.length === 0) && (
            <p className="empty-order">No items yet.</p>
          )}

          {activeOrder &&
            activeOrder.items.map((o) => (
              <div key={o.menu_item_id} className="order-row">
                <div
                  className="order-item-info"
                  onClick={() =>
                    changeItemQty(o.menu_item_id, +1)
                  }
                >
                  <div className="order-item-name">{o.item_name}</div>
                  <div className="order-item-price">
                    ${Number(o.item_cost).toFixed(2)} each •{" "}
                    ${(Number(o.item_cost) * o.qty).toFixed(2)} total
                  </div>
                </div>
                <div className="order-item-controls">
                  <button
                    className="btn-minus"
                    onClick={() => changeItemQty(o.menu_item_id, -1)}
                  >
                    -
                  </button>
                  <span className="qty">{o.qty}</span>
                  <button
                    className="btn-plus"
                    onClick={() => changeItemQty(o.menu_item_id, +1)}
                  >
                    +
                  </button>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem(o.menu_item_id)}
                  >
                    ×
                  </button>
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
            disabled={!activeOrder || activeOrder.items.length === 0 || placing}
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
          <button
            className="clear-btn"
            onClick={clearActiveOrder}
            disabled={!activeOrder || activeOrder.items.length === 0}
          >
            Clear
          </button>
          {activeOrder && (
            <button
              className="hold-btn"
              onClick={() => holdOrder(activeOrder.id)}
            >
              Hold
            </button>
          )}
        </div>
      </div>

      {quantityPad.open && (
        <QuantityPadModal
          item={quantityPad.item}
          onClose={() => setQuantityPad({ open: false, item: null })}
          onApply={applyQuantityPad}
        />
      )}
    </div>
  );
}

function QuantityPadModal({ item, onClose, onApply }) {
  const [value, setValue] = useState("");

  function press(n) {
    setValue((prev) => (prev + n).slice(0, 3));
  }

  function clear() {
    setValue("");
  }

  function submit() {
    const qty = parseInt(value || "0", 10);
    onApply(qty);
  }

  return (
    <div className="qty-modal-backdrop" onClick={onClose}>
      <div
        className="qty-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Quantity for {item.item_name}</h3>
        <div className="qty-display">{value || 0}</div>
        <div className="qty-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => press(String(n))}>
              {n}
            </button>
          ))}
          <button onClick={clear}>Clear</button>
          <button onClick={() => press("0")}>0</button>
          <button className="qty-add" onClick={submit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
