import React, {useEffect, useRef, useState} from 'react';
import './CustomerKiosk.css';
import {API_BASE} from '../../config/api.js';

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
  const [toppingModal, setToppingModal] = useState({ isOpen: false, topping: null });
  const itemRefs = useRef([]);
  const categoryRefs = useRef([]);

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
      const existing = prevCart.find(cartItem => 
        cartItem.menu_item_id === item.menu_item_id && 
        (!cartItem.toppings || cartItem.toppings.length === 0)
      );
      if (existing) {
        return prevCart.map(cartItem =>
          cartItem.cart_item_id === existing.cart_item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cart_item_id: Math.random().toString(36).substring(2, 9), quantity: 1, toppings: [] }];
    });
  };

  const handleItemClick = (item) => {
    if (item.item_type === 'Toppings') {
      const drinksInCart = cart.filter(c => c.item_type !== 'Toppings');
      if (drinksInCart.length === 0) {
        alert("Please add a drink first.");
        return;
      }
      setToppingModal({ isOpen: true, topping: item });
    } else {
      addToCart(item);
    }
  };

  const removeFromCart = (cartItemId) => {
    const item = cart.find(i => i.cart_item_id === cartItemId);
    if (item) speak(`${item.item_name} removed from cart`);
    setCart(prevCart => prevCart.filter(item => item.cart_item_id !== cartItemId));
  };

  const totalPrice = cart.reduce((total, item) => {
    const itemCost = Number(item.item_cost);
    const toppingsCost = item.toppings?.reduce((sum, t) => sum + Number(t.item_cost) * t.quantity, 0) || 0;
    return total + (itemCost + toppingsCost) * item.quantity;
  }, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;

    speak("Order submitted");

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.flatMap(item => {
            return [{menu_item_id: item.menu_item_id, quantity: item.quantity}];
          }),
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
      const totalCategories = categories.length;
      const totalItems = filteredItems.length;

      const activeCategory = categoryRefs.current.findIndex(
        el => el === document.activeElement
      );

      if (e.key === "ArrowDown") {
        if (activeCategory !== -1) {
          setFocusIndex(0);
          itemRefs.current[0]?.focus();
          return;
        }
        if (focusIndex < totalItems - 1) {
          setFocusIndex(focusIndex + 1);
        }
      }

      if (e.key === "ArrowUp") {
        if (focusIndex > 0) {
          setFocusIndex(focusIndex - 1);
        } else {
          categoryRefs.current[0]?.focus();
        }
      }

      if (e.key === "ArrowLeft") {
        if (activeCategory > 0) {
          categoryRefs.current[activeCategory - 1]?.focus();
        }
      }

      if (e.key === "ArrowRight") {
        if (activeCategory !== -1 && activeCategory < totalCategories - 1) {
          categoryRefs.current[activeCategory + 1]?.focus();
        }
      }

      if (e.key === "Enter") {
        if (activeCategory !== -1) {
          const cat = categories[activeCategory];
          setSelectedCategory(cat);
          speak(`Category: ${cat}`);
          return;
        }
        const item = filteredItems[focusIndex];
        handleItemClick(item);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyboardMode, filteredItems, focusIndex, categories]);

  useEffect(() => {
    if (keyboardMode && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].focus();
      itemRefs.current[focusIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusIndex, keyboardMode]);

  if (loading) {
    return <div className="kiosk-loading">Loading menu…</div>;
  }

  return (
    <div
      className="kiosk-container"
      style={{ '--scale': fontScale }}
    >
      <header className="kiosk-header-small">
        <h1>Boba Bytes</h1>
        <div className="cart-icon-header">
          <span>Cart: {cart.length}</span>
        </div>
      </header>

      <div className="accessibility-bar">
        <label>Text Size:</label>
        <div className="text-size-controls">
          <button 
            className="size-btn" 
            onClick={() => setFontScale(prev => Math.max(0.6, prev - 0.1))}
            aria-label="Decrease text size"
          >
            -
          </button>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.1"
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            aria-label="Text size slider"
          />
          <button 
            className="size-btn" 
            onClick={() => setFontScale(prev => Math.min(1.6, prev + 0.1))}
            aria-label="Increase text size"
          >
            +
          </button>
        </div>

        <button
          className={`access-btn ${speakMode ? 'active' : ''}`}
          onClick={() => {
            setSpeakMode(!speakMode);
            speak(!speakMode ? "Audio guidance enabled" : "Audio guidance disabled");
          }}
        >
          {speakMode ? "Speaker On" : "Speaker Off"}
        </button>

        <button
          className={`access-btn ${keyboardMode ? 'active' : ''}`}
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
            ref={(el) => (categoryRefs.current[index] = el)}
            tabIndex={keyboardMode ? 0 : -1}
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
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={keyboardMode ? 0 : -1}
              aria-label={`Add ${item.item_name} to cart`}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.item_name}
                  className="item-image"
                />
              )}
              <div className="item-info">
                <h3>{item.item_name}</h3>
                <p className="price">${Number(item.item_cost).toFixed(2)}</p>
                {item.item_description && (
                <p className="item-description">{item.item_description}</p>
)}

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
              <div key={item.cart_item_id} className="cart-item">
                <div style={{ flex: 1 }}>
                  <div>
                    <span>{item.item_name}</span>
                    <span className="qty"> × {item.quantity}</span>
                  </div>
                  {item.toppings && item.toppings.length > 0 && (
                     <div className="topping-items">
                        {item.toppings.map((t, idx) => (
                           <div key={idx}>+ {t.item_name} {t.quantity > 1 ? `(x${t.quantity})` : ''}</div>
                        ))}
                     </div>
                  )}
                </div>
                <div className="cart-item-right">
                  <span>${((Number(item.item_cost) + (item.toppings?.reduce((sum, t) => sum + Number(t.item_cost) * t.quantity, 0) || 0)) * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
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

      {toppingModal.isOpen && (
        <div className="topping-modal-overlay">
          <div className="topping-modal-content">
            <h2>Add {toppingModal.topping?.item_name} to which drink?</h2>
            <div style={{ marginTop: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
              {cart.filter(c => c.item_type !== 'Toppings').map(drink => (
                <button
                   key={drink.cart_item_id}
                   className="drink-list-btn"
                   onClick={() => {
                      setCart(prev => prev.map(c => {
                        if (c.cart_item_id === drink.cart_item_id) {
                           const existing = c.toppings?.find(t => t.menu_item_id === toppingModal.topping.menu_item_id);
                           const newToppings = c.toppings ? [...c.toppings] : [];
                           if (existing) {
                              return {
                                 ...c,
                                 toppings: newToppings.map(t => t.menu_item_id === toppingModal.topping.menu_item_id ? {...t, quantity: t.quantity + 1} : t)
                              };
                           } else {
                              newToppings.push({...toppingModal.topping, quantity: 1});
                              return { ...c, toppings: newToppings };
                           }
                        }
                        return c;
                      }));
                      setToppingModal({ isOpen: false, topping: null });
                   }}
                >
                   {drink.item_name} (Qty: {drink.quantity})
                </button>
              ))}
            </div>
            <button className="cancel-modal-btn" onClick={() => setToppingModal({ isOpen: false, topping: null })}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerKiosk;
