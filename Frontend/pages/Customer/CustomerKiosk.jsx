import React, { useEffect, useRef, useState } from 'react';
import './CustomerKiosk.css';
import { API_BASE } from '../../config/api.js';

const TOPPINGS = [
  { name: 'Boba', price: 0.99 },
  { name: 'Coffee Jelly', price: 0.99 },
  { name: 'Ice Cream', price: 0.49 },
  { name: 'Taro Balls', price: 0.49 }
];

function CustomerKiosk() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1.2);
  const [speakMode, setSpeakMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [toppingModal, setToppingModal] = useState({ isOpen: false, topping: null });

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [openTopping, setOpenTopping] = useState(null);

  const itemRefs = useRef([]);
  const categoryRefs = useRef([]);
  const synth = window.speechSynthesis;

  const normalizeName = (value = '') =>
    value.toLowerCase().trim().replace(/\s+/g, ' ');

  const localImageByName = {
    'classic milk tea': '/images/menu/classic_milk_tea.png',
    'thai milk tea': '/images/menu/thai_milk_tea.png',
    'taro milk tea': '/images/menu/taro_milk_tea.png',
    'matcha milk tea': '/images/menu/matcha_milk_tea.png',
    'okinawa brown sugar milk tea': '/images/menu/okinawa_brown_sugar_milk_tea.png',
    'honey green milk tea': '/images/menu/honey_green_milk_tea.png',
    'wintermelon milk tea': '/images/menu/wintermelon_milk_tea.png',
    'winter melon milk tea': '/images/menu/wintermelon_milk_tea.png',
    'coffee milk tea': '/images/menu/coffee_milk_tea.png',
    'mango green tea': '/images/menu/mango_green_tea.png',
    'strawberry fruit tea': '/images/menu/strawberry_fruit_tea.png',
    'peach black tea': '/images/menu/peach_black_tea.png',
    'lychee oolong tea': '/images/menu/lychee_oolong_tea.png',
    'additional boba': '/images/menu/additional_boba.png'
  };

  const generatedDescriptionByName = {
    'classic milk tea': 'Smooth black tea with creamy milk for a rich, classic boba taste.',
    'thai milk tea': 'Bold Thai tea with sweet cream notes and a fragrant spiced finish.',
    'taro milk tea': 'Nutty taro flavor blended with milk for a sweet and velvety drink.',
    'matcha milk tea': 'Earthy matcha and creamy milk balanced into a refreshing green tea latte.',
    'okinawa brown sugar milk tea': 'Caramel-like brown sugar syrup mixed into creamy milk tea.',
    'honey green milk tea': 'Light green tea and milk with a mellow honey sweetness.',
    'wintermelon milk tea': 'Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.',
    'winter melon milk tea': 'Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.',
    'coffee milk tea': 'A coffee-forward milk tea with creamy body and a gentle caffeine kick.',
    'mango green tea': 'Crisp green tea with juicy mango flavor for a bright tropical sip.',
    'strawberry fruit tea': 'Fruity strawberry tea that is sweet, vibrant, and refreshing.',
    'peach black tea': 'Classic black tea infused with ripe peach flavor.',
    'lychee oolong tea': 'Floral oolong tea paired with delicate lychee sweetness.',
    'additional boba': 'Chewy tapioca pearls to add extra texture to your drink.'
  };

  const placeholderSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420"><rect width="100%" height="100%" fill="#f5c4a1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5c3d2e" font-size="28" font-family="Arial,sans-serif">Boba Bytes</text></svg>'
    );

  const getItemImageSrc = (item) => {
    const normalized = normalizeName(item.item_name);
    const localImage = localImageByName[normalized];
    if (localImage) return localImage;
    if (item.image) return item.image;
    return placeholderSvg;
  };

  const getItemDescription = (item) => {
    if (item.item_description && item.item_description.trim()) return item.item_description;
    const normalized = normalizeName(item.item_name);
    if (generatedDescriptionByName[normalized]) return generatedDescriptionByName[normalized];
    return `A ${item.item_type || 'house'} favorite made fresh at Boba Bytes.`;
  };

  const speak = (text) => {
    if (!speakMode) return;
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(text));
  };

  const getToppingPriceByName = (name) => {
    const t = TOPPINGS.find((x) => x.name === name);
    return t ? t.price : 0;
  };

  useEffect(() => {
    async function loadMenu() {
      try {
        const itemsRes = await fetch(`${API_BASE}/menu/items`);
        const items = await itemsRes.json();
        const catsRes = await fetch(`${API_BASE}/menu/categories`);
        let cats = await catsRes.json();
        if (!cats || cats.length === 0) {
          cats = [...new Set(items.map((item) => item.item_type).filter(Boolean))];
        }
        setMenuItems(items);
        setCategories(['All', ...cats]);
      } catch (error) {
        alert('Could not load menu. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.item_type === selectedCategory);

  const drinksMatch = (a, b) => {
    const aT = (a.toppings || []).map((t) => ({ name: t.name, quantity: t.quantity })).sort((x, y) => x.name.localeCompare(y.name));
    const bT = (b.toppings || []).map((t) => ({ name: t.name, quantity: t.quantity })).sort((x, y) => x.name.localeCompare(y.name));
    return (
      a.menu_item_id === b.menu_item_id &&
      a.size === b.size &&
      a.ice === b.ice &&
      a.sugar === b.sugar &&
      JSON.stringify(aT) === JSON.stringify(bT)
    );
  };

  const openCustomization = (item, index = null) => {
    setCurrentDrink(item);
    setEditingIndex(index);
    if (index !== null) {
      const existing = cart[index];
      setSelectedSize(existing.size);
      setSelectedIce(existing.ice);
      setSelectedSugar(existing.sugar);
      setSelectedToppings(existing.toppings || []);
    } else {
      setSelectedSize(null);
      setSelectedIce(null);
      setSelectedSugar(null);
      setSelectedToppings([]);
    }
    setOpenTopping(null);
    setCustomModalOpen(true);
  };

  const handleItemClick = (item) => {
    if (item.item_type === 'Toppings') {
      const drinksInCart = cart.filter((c) => c.item_type !== 'Toppings');
      if (drinksInCart.length === 0) {
        alert('Please add a drink first.');
        return;
      }
      setToppingModal({ isOpen: true, topping: item });
    } else {
      openCustomization(item);
    }
  };

  const computeToppingsCostPerDrink = (toppings) =>
    (toppings || []).reduce((sum, t) => sum + Number(t.price) * t.quantity, 0);

  const saveDrink = () => {
    const basePrice = Number(currentDrink.item_cost);
    const toppingsCost = computeToppingsCostPerDrink(selectedToppings);

    const drinkOrder = {
      cart_item_id:
        editingIndex !== null
          ? cart[editingIndex].cart_item_id
          : Math.random().toString(36).substring(2, 9),
      menu_item_id: currentDrink.menu_item_id,
      item_name: currentDrink.item_name,
      item_type: currentDrink.item_type,
      size: selectedSize || 'Medium',
      ice: selectedIce || 'Regular Ice',
      sugar: selectedSugar || '100%',
      toppings: selectedToppings.filter((t) => t.quantity > 0),
      quantity: editingIndex !== null ? cart[editingIndex].quantity : 1,
      base_cost: basePrice
    };

    if (editingIndex !== null) {
      const updated = [...cart];
      updated[editingIndex] = drinkOrder;
      setCart(updated);
    } else {
      setCart((prev) => {
        const existingIndex = prev.findIndex((c) => drinksMatch(c, drinkOrder));
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1
          };
          return updated;
        }
        return [...prev, drinkOrder];
      });
    }

    setCustomModalOpen(false);
    setEditingIndex(null);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const duplicateDrink = (cartItemId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cart_item_id === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const totalPrice = cart.reduce((total, item) => {
    const toppingsCost = computeToppingsCostPerDrink(item.toppings);
    const perDrink = Number(item.base_cost) + toppingsCost;
    return total + perDrink * item.quantity;
  }, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    speak('Order submitted');
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity
          })),
          total: totalPrice
        })
      });
      if (response.ok) {
        alert('Order submitted successfully');
        setCart([]);
      } else {
        alert('Failed to submit order');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  useEffect(() => {
    if (!keyboardMode) return;
    const handleKey = (e) => {
      const totalCategories = categories.length;
      const totalItems = filteredItems.length;
      const activeCategory = categoryRefs.current.findIndex(
        (el) => el === document.activeElement
      );

      if (e.key === 'ArrowDown') {
        if (activeCategory !== -1) {
          setFocusIndex(0);
          itemRefs.current[0]?.focus();
          return;
        }
        if (focusIndex < totalItems - 1) setFocusIndex(focusIndex + 1);
      }

      if (e.key === 'ArrowUp') {
        if (focusIndex > 0) setFocusIndex(focusIndex - 1);
        else categoryRefs.current[0]?.focus();
      }

      if (e.key === 'ArrowLeft') {
        if (activeCategory > 0) categoryRefs.current[activeCategory - 1]?.focus();
      }

      if (e.key === 'ArrowRight') {
        if (activeCategory !== -1 && activeCategory < totalCategories - 1)
          categoryRefs.current[activeCategory + 1]?.focus();
      }

      if (e.key === 'Enter') {
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
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [keyboardMode, filteredItems, focusIndex, categories]);

  useEffect(() => {
    if (keyboardMode && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].focus();
      itemRefs.current[focusIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusIndex, keyboardMode]);

  const handleToppingHeaderClick = (name) => {
    setOpenTopping((prev) => (prev === name ? null : name));
  };

  const getSelectedTopping = (name) =>
    selectedToppings.find((t) => t.name === name) || null;

  const incrementTopping = (name) => {
    setSelectedToppings((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (existing) {
        return prev.map((t) =>
          t.name === name ? { ...t, quantity: t.quantity + 1 } : t
        );
      }
      const price = getToppingPriceByName(name);
      return [...prev, { name, price, quantity: 1 }];
    });
  };

  const decrementTopping = (name) => {
    setSelectedToppings((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((t) => t.name !== name);
      }
      return prev.map((t) =>
        t.name === name ? { ...t, quantity: t.quantity - 1 } : t
      );
    });
  };

  if (loading) return <div className="kiosk-loading">Loading menu...</div>;

  return (
    <div className="kiosk-container" style={{ '--scale': fontScale }}>
      <header className="kiosk-top-header">
        <div className="kiosk-header-small">
          <h1>Boba Bytes</h1>
          <div className="kiosk-header-actions">
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
            <div className="accessibility-bar">
              <label>Text Size:</label>
              <button
                className="size-btn"
                onClick={() => setFontScale((prev) => Math.max(0.6, prev - 0.1))}
                aria-label="Decrease text size"
              >
                -
              </button>
              <button
                className="size-btn"
                onClick={() => setFontScale((prev) => Math.min(1.6, prev + 0.1))}
                aria-label="Increase text size"
              >
                +
              </button>
              <button
                className={`access-btn ${speakMode ? 'active' : ''}`}
                onClick={() => {
                  setSpeakMode(!speakMode);
                  speak(!speakMode ? 'Audio guidance enabled' : 'Audio guidance disabled');
                }}
              >
                {speakMode ? 'Speaker On' : 'Speaker Off'}
              </button>
              <button
                className={`access-btn ${keyboardMode ? 'active' : ''}`}
                onClick={() => {
                  setKeyboardMode(!keyboardMode);
                  speak(
                    !keyboardMode
                      ? 'Keyboard navigation enabled'
                      : 'Keyboard navigation disabled'
                  );
                }}
              >
                {keyboardMode ? 'Keyboard On' : 'Keyboard Off'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="menu-grid">
          {filteredItems.map((item, index) => (
            <div
              key={item.menu_item_id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`menu-card ${keyboardMode && focusIndex === index ? 'focused' : ''}`}
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={keyboardMode ? 0 : -1}
              aria-label={`Add ${item.item_name} to cart`}
            >
              <img
                src={getItemImageSrc(item)}
                alt={item.item_name}
                className="item-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderSvg;
                }}
              />
              <div className="item-info">
                <h3>{item.item_name}</h3>
                <p className="item-description">{getItemDescription(item)}</p>
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
            cart.map((item, index) => {
              const toppingsCost = computeToppingsCostPerDrink(item.toppings);
              const perDrink = Number(item.base_cost) + toppingsCost;
              return (
                <div key={item.cart_item_id} className="cart-item">
                  <div style={{ flex: 1 }} onClick={() => openCustomization(item, index)}>
                    <div>
                      <span>{item.item_name}</span>
                      <span className="qty"> x {item.quantity}</span>
                    </div>
                    <div className="topping-items">
                      <div>Size: {item.size}</div>
                      <div>Ice: {item.ice}</div>
                      <div>Sugar: {item.sugar}</div>
                      {item.toppings &&
                        item.toppings.length > 0 &&
                        item.toppings.map((t, idx) => (
                          <div key={idx}>
                            + {t.name}
                            {t.quantity > 1 ? ` x${t.quantity}` : ''}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span>${(perDrink * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => duplicateDrink(item.cart_item_id)}
                      className="remove-btn"
                      aria-label={`Duplicate ${item.item_name}`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      className="remove-btn"
                      aria-label={`Remove ${item.item_name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
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

      {customModalOpen && currentDrink && (
        <div className="topping-modal-overlay">
          <div className="topping-modal-content">
            <h2>Customize {currentDrink.item_name}</h2>

            <div className="custom-section">
              <label>Size</label>
              <div className="option-group">
                {['Small', 'Medium', 'Large'].map((s) => (
                  <button
                    key={s}
                    className={`option-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>Ice</label>
              <div className="option-group">
                {['No Ice', 'Less Ice', 'Regular Ice', 'Extra Ice'].map((i) => (
                  <button
                    key={i}
                    className={`option-btn ${selectedIce === i ? 'active' : ''}`}
                    onClick={() => setSelectedIce(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>Sugar</label>
              <div className="option-group">
                {['0%', '25%', '50%', '75%', '100%'].map((s) => (
                  <button
                    key={s}
                    className={`option-btn ${selectedSugar === s ? 'active' : ''}`}
                    onClick={() => setSelectedSugar(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>Toppings</label>
              {TOPPINGS.map((t) => {
                const selected = getSelectedTopping(t.name);
                const qty = selected ? selected.quantity : 0;
                const isOpen = openTopping === t.name;
                return (
                  <div key={t.name}>
                    <hr className="topping-separator" />
                    <div
                      className="topping-header-row"
                      onClick={() => handleToppingHeaderClick(t.name)}
                    >
                      <span>{t.name}</span>
                      <span>{isOpen ? '▼' : '►'}</span>
                    </div>
                    {isOpen && (
                      <div className="topping-quantity-row">
                        <button onClick={() => decrementTopping(t.name)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => incrementTopping(t.name)}>+</button>
                        <span>${t.price.toFixed(2)} each</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <hr className="topping-separator" />
            </div>

            <button className="confirm-btn" onClick={saveDrink}>
              {editingIndex !== null ? 'Save Changes' : 'Add to Cart'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setCustomModalOpen(false);
                setEditingIndex(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toppingModal.isOpen && (
        <div className="topping-modal-overlay">
          <div className="topping-modal-content">
            <h2>Add {toppingModal.topping?.item_name} to which drink?</h2>
            <div style={{ marginTop: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
              {cart
                .filter((c) => c.item_type !== 'Toppings')
                .map((drink) => (
                  <button
                    key={drink.cart_item_id}
                    className="drink-list-btn"
                    onClick={() => {
                      setCart((prev) =>
                        prev.map((c) => {
                          if (c.cart_item_id === drink.cart_item_id) {
                            const name = toppingModal.topping.item_name;
                            const price = getToppingPriceByName(name);
                            const existing = (c.toppings || []).find((t) => t.name === name);
                            let newToppings;
                            if (existing) {
                              newToppings = c.toppings.map((t) =>
                                t.name === name ? { ...t, quantity: t.quantity + 1 } : t
                              );
                            } else {
                              newToppings = [...(c.toppings || []), { name, price, quantity: 1 }];
                            }
                            return { ...c, toppings: newToppings };
                          }
                          return c;
                        })
                      );
                      setToppingModal({ isOpen: false, topping: null });
                    }}
                  >
                    {drink.item_name} (Qty: {drink.quantity})
                  </button>
                ))}
            </div>
            <button
              className="cancel-modal-btn"
              onClick={() => setToppingModal({ isOpen: false, topping: null })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerKiosk;
