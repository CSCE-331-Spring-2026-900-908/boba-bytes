import React, { useState, useEffect, useRef } from 'react';
import './CustomerKiosk.css';
import { API_BASE } from '../../config/api.js';

function CustomerKiosk() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontScale, setFontScale] = useState(1);
  const [speakMode, setSpeakMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);

  const [focusIndex, setFocusIndex] = useState(0);
  const itemRefs = useRef([]);

  const synth = window.speechSynthesis;

  const speak = (text) => {
    if (!speakMode) return;
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(text));
  };

  useEffect(() => {
    async function loadMenu() {
      try {
        const itemsRes = await fetch(`${API_BASE}/menu/items`);
        const items = await itemsRes.json();

        const catsRes = await fetch(`${API_BASE}/menu/categories`);
        let cats = await catsRes.json();

        if (!cats || cats.length === 0) {
          cats = [...new Set(items.map(item => item.item_type).filter(Boolean))];
        }

        setMenuItems(items);
        setCategories(['All', ...cats]);
      } catch (error) {
        alert("Could not load menu. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter(item => item.item_type === selectedCategory);

  const addToCart = (item) => {
    speak(`${item.item_name} added to cart`);
    setCart(prevCart => {
      const existing = prevCart.find(cartItem => cartItem.menu_item_id === item.menu_item_id);
      if (existing) {
        return prevCart.map(cartItem =>
          cartItem.menu_item_id === item.menu_item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.menu_item_id === id);
    speak(`${item.item_name} removed from cart`);
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== id));
  };

  const totalPrice = cart.reduce((total, item) => {
    return total + item.item_cost * item.quantity;
  }, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;

    speak("Order submitted");

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity
          })),
          total: totalPrice
        })
      });

      if (response.ok) {
        alert("Order submitted successfully");
        setCart([]);
      } else {
        alert("Failed to submit order");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  useEffect(() => {
    if (!keyboardMode) return;

    const handleKey = (e) => {
      if (filteredItems.length === 0) return;

      if (e.key === "ArrowDown") {
        setFocusIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        setFocusIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        const item = filteredItems[focusIndex];
        addToCart(item);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyboardMode, filteredItems, focusIndex]);

  useEffect(() => {
    if (keyboardMode && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusIndex, keyboardMode]);

  if (loading) {
    return <div className="kiosk-loading">Loading menu…</div>;
  }

  return (
    <div
      className="kiosk-container"
      style={{ fontSize: `${fontScale}rem` }}
    >
      <header className="kiosk-header-small">
        <h1>Boba Bytes</h1>
        <div className="cart-icon-header">
          <span>Cart: {cart.length}</span>
        </div>
      </header>

      <div className="accessibility-bar">
        <label>Text Size:</label>
        <input
          type="range"
          min="0.8"
          max="1.6"
          step="0.1"
          value={fontScale}
          onChange={(e) => setFontScale(Number(e.target.value))}
        />

        <button
          className={`speak-toggle ${speakMode ? 'active' : ''}`}
          onClick={() => {
            setSpeakMode(!speakMode);
            speak(!speakMode ? "Audio guidance enabled" : "Audio guidance disabled");
          }}
        >
          {speakMode ? "Speaking On" : "Speaking Off"}
        </button>

        <button
          className={`keyboard-toggle ${keyboardMode ? 'active' : ''}`}
          onClick={() => {
            setKeyboardMode(!keyboardMode);
            speak(!keyboardMode ? "Keyboard navigation enabled" : "Keyboard navigation disabled");
          }}
        >
          {keyboardMode ? "Keyboard On" : "Keyboard Off"}
        </button>
      </div>

      <div className="category-bar">
        {categories.map((cat, index) => (
          <button
            key={cat ?? index}
            onClick={() => {
              setSelectedCategory(cat);
              speak(`Category: ${cat}`);
            }}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            aria-label={`Select category ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="main-content">
        <div className="menu-grid">
          {filteredItems.map((item, index) => (
            <div
              key={item.menu_item_id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`menu-card ${keyboardMode && focusIndex === index ? "focused" : ""}`}
              onClick={() => addToCart(item)}
              role="button"
              tabIndex="0"
              aria-label={`Add ${item.item_name} to cart`}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-image"
                />
              )}
              <div className="item-info">
                <h3>{item.item_name}</h3>
                <p className="price">${Number(item.item_cost).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-sidebar" aria-live="polite">
          <h2>Your Cart ({cart.length})</h2>

          {cart.length === 0 ? (
            <p className="empty-cart">Tap any drink to start your order</p>
          ) : (
            cart.map(item => (
              <div key={item.menu_item_id} className="cart-item">
                <div>
                  <span>{item.item_name}</span>
                  <span className="qty"> × {item.quantity}</span>
                </div>
                <div className="cart-item-right">
                  <span>${(item.item_cost * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="remove-btn"
                    aria-label={`Remove ${item.item_name} from cart`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="cart-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={submitOrder}
            className="submit-order-btn"
            disabled={cart.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerKiosk;
