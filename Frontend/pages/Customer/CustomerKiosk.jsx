import React, { useState, useEffect } from 'react';
import './CustomerKiosk.css';
import { API_BASE } from '../../config/api.js';

function CustomerKiosk() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load menu", error);
        alert("Could not load menu. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.item_type === selectedCategory);


  const addToCart = (item) => {
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
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== id));
  };

  const totalPrice = cart.reduce((total, item) => {
    return total + item.item_cost * item.quantity;
  }, 0);

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

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
        alert("Order submitted successfully! Thank you!");
        setCart([]);        // Clear cart after success
      } else {
        alert("Failed to submit order");
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please check if backend is running.");
    }
  };

  if (loading) {
    return <div className="kiosk-loading">Loading menu… </div>;
  }

  return (
    <div className="kiosk-container">
      {/* Header */}
      <header className="kiosk-header">
        <h1>Boba Bytes</h1>
        <p className="tagline">Build your perfect bubble tea!</p>
      </header>

      <div className="category-bar">
        {categories.map((cat, index) => (
            <button
                key={cat ?? index}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
        ))}
      </div>

      <div className="main-content">
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div
              key={item.menu_item_id}
              className="menu-card"
              onClick={() => addToCart(item)}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-image"
                />
              )}
              <div className="item-info">
                <h3 className="font-bold text-2xl">{item.item_name}</h3>
                <p className="price">${Number(item.item_cost).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-sidebar">
          <h2>Your Cart ({cart.length})</h2>

          {cart.length === 0 ? (
            <p className="empty-cart">Tap any drink to start your order!</p>
          ) : (
            cart.map(item => (
              <div key={item.menu_item_id } className="cart-item">
                <div>
                  <span>{item.item_name}</span>
                  <span className="qty"> × {item.quantity}</span>
                </div>
                <div className="cart-item-right">
                  <span>${(item.item_cost * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="remove-btn"
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
            Place Order 🧋
          </button>
        </div>
      </div>

      <footer className="kiosk-footer">
        Touchscreen Kiosk • Boba Bytes
      </footer>
    </div>
  );
}

export default CustomerKiosk;