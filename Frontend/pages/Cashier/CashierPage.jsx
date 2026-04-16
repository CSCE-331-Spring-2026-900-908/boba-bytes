import React, { useState, useEffect, useMemo, useRef } from "react";
import "./Cashier.css";
import { API_BASE } from "../../config/api.js";

const ICE_OPTIONS = ["No Ice", "Less Ice", "Regular Ice", "Extra Ice"];
const SUGAR_OPTIONS = ["0%", "25%", "50%", "75%", "100%"];

export default function CashierPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [order, setOrder] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedIce, setSelectedIce] = useState("Regular Ice");
  const [selectedSugar, setSelectedSugar] = useState("100%");
  const [selectedToppings, setSelectedToppings] = useState([]);

  const [placing, setPlacing] = useState(false);
  const searchInputRef = useRef(null);

  const toppingItems = useMemo(
    () => items.filter(i => i.item_type === "Toppings"),
    [items]
  );

  // Load menu + categories
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/menu/items`).then(r => r.json()),
      fetch(`${API_BASE}/menu/categories`).then(r => r.json())
    ])
      .then(([itemData, catData]) => {
        setItems(itemData);
        setCategories(["All", "Favorites", ...catData]);
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
    } else if (activeCategory !== "All") {
      list = list.filter(i => i.item_type === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(i => i.item_name.toLowerCase().includes(q));
    }

    return list;
  }, [items, activeCategory, favoriteIds, searchTerm]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const targetTag = e.target?.tagName?.toLowerCase();
      const typingTarget = targetTag === "input" || targetTag === "textarea" || targetTag === "select";

      if ((e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) && !typingTarget) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select?.();
      }

      if (e.key === "Escape" && searchTerm) {
        setSearchTerm("");
      }

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        placeOrder();
      }

      if (e.key === "Enter" && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        if (filteredItems.length > 0) {
          handleAdd(filteredItems[0]);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredItems, searchTerm, order.length, placeOrder]);

  const sameDrinkConfig = (a, b) => {
    const toppingsA = [...(a.toppings || [])]
      .map(t => ({ id: t.menu_item_id, qty: t.quantity }))
      .sort((x, y) => x.id - y.id);
    const toppingsB = [...(b.toppings || [])]
      .map(t => ({ id: t.menu_item_id, qty: t.quantity }))
      .sort((x, y) => x.id - y.id);

    return (
      a.menu_item_id === b.menu_item_id &&
      a.ice === b.ice &&
      a.sugar === b.sugar &&
      JSON.stringify(toppingsA) === JSON.stringify(toppingsB)
    );
  };

  function openCustomization(item, index = null) {
    setCurrentDrink(item);
    setEditingIndex(index);

    if (index !== null) {
      const existing = order[index];
      setSelectedIce(existing.ice || "Regular Ice");
      setSelectedSugar(existing.sugar || "100%");
      setSelectedToppings(existing.toppings || []);
    } else {
      setSelectedIce("Regular Ice");
      setSelectedSugar("100%");
      setSelectedToppings([]);
    }

    setCustomModalOpen(true);
  }

  function saveDrinkCustomization() {
    if (!currentDrink) return;

    const nextDrink = {
      menu_item_id: currentDrink.menu_item_id,
      item_name: currentDrink.item_name,
      item_cost: Number(currentDrink.item_cost),
      qty: editingIndex !== null ? order[editingIndex].qty : 1,
      ice: selectedIce,
      sugar: selectedSugar,
      toppings: selectedToppings
        .filter(t => t.quantity > 0)
        .map(t => ({ ...t, item_cost: Number(t.item_cost) }))
    };

    if (editingIndex !== null) {
      setOrder(prev => {
        const copy = [...prev];
        copy[editingIndex] = nextDrink;
        return copy;
      });
    } else {
      setOrder(prev => {
        const existingIndex = prev.findIndex(o => sameDrinkConfig(o, nextDrink));
        if (existingIndex !== -1) {
          const copy = [...prev];
          copy[existingIndex] = { ...copy[existingIndex], qty: copy[existingIndex].qty + 1 };
          return copy;
        }
        return [...prev, nextDrink];
      });
    }

    setCustomModalOpen(false);
    setCurrentDrink(null);
    setEditingIndex(null);
  }

  // Add topping to last drink for quick cashier flow
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
        toppings: (() => {
          const existing = (last.toppings || []).find(
            t => t.menu_item_id === item.menu_item_id
          );
          if (existing) {
            return last.toppings.map(t =>
              t.menu_item_id === item.menu_item_id
                ? { ...t, quantity: (t.quantity || 1) + 1 }
                : t
            );
          }
          return [...(last.toppings || []), { ...item, quantity: 1 }];
        })()
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
      openCustomization(item);
    }
  }

  function getSelectedToppingQty(toppingId) {
    return selectedToppings.find(t => t.menu_item_id === toppingId)?.quantity || 0;
  }

  function incrementSelectedTopping(item) {
    setSelectedToppings(prev => {
      const existing = prev.find(t => t.menu_item_id === item.menu_item_id);
      if (existing) {
        return prev.map(t =>
          t.menu_item_id === item.menu_item_id
            ? { ...t, quantity: t.quantity + 1 }
            : t
        );
      }
      return [...prev, { ...item, item_cost: Number(item.item_cost), quantity: 1 }];
    });
  }

  function decrementSelectedTopping(item) {
    setSelectedToppings(prev => {
      const existing = prev.find(t => t.menu_item_id === item.menu_item_id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter(t => t.menu_item_id !== item.menu_item_id);
      }
      return prev.map(t =>
        t.menu_item_id === item.menu_item_id
          ? { ...t, quantity: t.quantity - 1 }
          : t
      );
    });
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
        (s, t) => s + Number(t.item_cost) * (t.quantity || 1) * o.qty,
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
          payment_type: "cashier",
          items: order.map(o => ({
            menu_item_id: o.menu_item_id,
            quantity: o.qty,
            ice_level: o.ice,
            sugar_level: o.sugar,
            toppings: o.toppings.map(t => ({
              topping_id: t.menu_item_id,
              quantity: t.quantity || 1
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
        <div className="cashier-sidebar-title">Quick Categories</div>
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
        <div className="cashier-toolbar">
          <input
            ref={searchInputRef}
            className="cashier-search"
            placeholder="Search menu items...  / or Ctrl+K"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="cashier-hints">
            <span>Enter: add first match</span>
            <span>Ctrl+Enter: place order</span>
            <span>Esc: clear search</span>
          </div>
        </div>

        <div className="cashier-results-meta">
          <span>{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} visible</span>
        </div>

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
        <div className="order-subheader">Ctrl+Enter to send fast</div>

        <div className="order-items">
          {order.length === 0 && <div className="order-empty">No items added yet.</div>}
          {order.map((o, index) => (
            <div key={index} className="order-row">
              <div className="order-item-info">
                <div className="order-item-name" onClick={() => openCustomization(o, index)}>
                  {o.item_name}
                </div>
                <div className="order-customization-line">
                  Ice: {o.ice || "Regular Ice"} • Sugar: {o.sugar || "100%"}
                </div>

                {o.toppings.length > 0 && (
                  <div className="order-toppings">
                    {o.toppings.map((t, i) => (
                      <div key={i} className="topping-line">
                        + {t.item_name}
                        {t.quantity > 1 ? ` x${t.quantity}` : ""} (${Number(t.item_cost).toFixed(2)})
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-item-price">
                  ${(o.item_cost * o.qty +
                    o.toppings.reduce(
                      (s, t) => s + Number(t.item_cost) * (t.quantity || 1) * o.qty,
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

      {customModalOpen && currentDrink && (
        <div className="cashier-modal-overlay" onClick={() => setCustomModalOpen(false)}>
          <div className="cashier-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Customize {currentDrink.item_name}</h2>

            <div className="cashier-custom-section">
              <label>Ice Level</label>
              <div className="cashier-option-group">
                {ICE_OPTIONS.map(option => (
                  <button
                    key={option}
                    className={`cashier-option-btn ${selectedIce === option ? "active" : ""}`}
                    onClick={() => setSelectedIce(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="cashier-custom-section">
              <label>Sugar Level</label>
              <div className="cashier-option-group">
                {SUGAR_OPTIONS.map(option => (
                  <button
                    key={option}
                    className={`cashier-option-btn ${selectedSugar === option ? "active" : ""}`}
                    onClick={() => setSelectedSugar(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="cashier-custom-section">
              <label>Toppings</label>
              <div className="cashier-topping-list">
                {toppingItems.map(t => (
                  <div key={t.menu_item_id} className="cashier-topping-row">
                    <span>
                      {t.item_name} (${Number(t.item_cost).toFixed(2)})
                    </span>
                    <div className="cashier-topping-controls">
                      <button onClick={() => decrementSelectedTopping(t)}>-</button>
                      <span>{getSelectedToppingQty(t.menu_item_id)}</span>
                      <button onClick={() => incrementSelectedTopping(t)}>+</button>
                    </div>
                  </div>
                ))}
                {toppingItems.length === 0 && (
                  <div className="cashier-empty-toppings">No topping items found in menu.</div>
                )}
              </div>
            </div>

            <div className="cashier-modal-actions">
              <button className="cashier-confirm-btn" onClick={saveDrinkCustomization}>
                {editingIndex !== null ? "Save Changes" : "Add Drink"}
              </button>
              <button
                className="cashier-cancel-btn"
                onClick={() => {
                  setCustomModalOpen(false);
                  setCurrentDrink(null);
                  setEditingIndex(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
