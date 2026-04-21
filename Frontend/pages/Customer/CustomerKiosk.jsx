import React, { useEffect, useRef, useState } from 'react';
import './CustomerKiosk.css';
import { API_BASE } from '../../config/api.js';

const TRANSLATIONS = {
  "Boba Bytes": { es: "Boba Bytes" },
  "Text Size": { es: "Tamaño de Texto" },
  "Decrease text size": { es: "Reducir tamaño de texto" },
  "Increase text size": { es: "Aumentar tamaño de texto" },
  "Speaker On": { es: "Audio Activado" },
  "Speaker Off": { es: "Audio Desactivado" },
  "Keyboard On": { es: "Teclado Activado" },
  "Keyboard Off": { es: "Teclado Desactivado" },
  "Your Cart": { es: "Tu Carrito" },
  "Tap any drink to start your order": { es: "Toca una bebida para comenzar tu orden" },
  "Total": { es: "Total" },
  "Place Order": { es: "Realizar Pedido" },
  "Customize": { es: "Personalizar" },
  "Size": { es: "Tamaño" },
  "Ice": { es: "Hielo" },
  "Sugar": { es: "Azúcar" },
  "Toppings": { es: "Toppings" },
  "Add to Cart": { es: "Agregar al Carrito" },
  "Save Changes": { es: "Guardar Cambios" },
  "Cancel": { es: "Cancelar" },
  "Send": { es: "Enviar" },
  "Tell me the weather, allergies, diet ...": { es: "Dime el clima, alergias, dieta..." },
  "Thinking of a drink for you...": { es: "Pensando en una bebida para ti..." },
  "Order submitted successfully": { es: "Pedido enviado con éxito" },
  "Failed to submit order": { es: "Error al enviar el pedido" },
  "Network error": { es: "Error de red" },

  // Drink names
  "classic milk tea": { es: "Té de leche clásico" },
  "thai milk tea": { es: "Té de leche Thai" },
  "taro milk tea": { es: "Té de leche de taro" },
  "matcha milk tea": { es: "Té de leche de matcha" },
  "okinawa brown sugar milk tea": { es: "Té de leche con azúcar morena de Okinawa" },
  "honey green milk tea": { es: "Té verde con miel y leche" },
  "wintermelon milk tea": { es: "Té de leche de melón de invierno" },
  "coffee milk tea": { es: "Té de leche con café" },
  "mango green tea": { es: "Té verde de mango" },
  "strawberry fruit tea": { es: "Té de fruta de fresa" },
  "peach black tea": { es: "Té negro de durazno" },
  "lychee oolong tea": { es: "Té oolong de lichi" },
  "additional boba": { es: "Boba adicional" },

  // Descriptions
  "Smooth black tea with creamy milk for a rich, classic boba taste.": {
    es: "Té negro suave con leche cremosa para un sabor clásico."
  },
  "Bold Thai tea with sweet cream notes and a fragrant spiced finish.": {
    es: "Té Thai intenso con notas dulces y un final especiado."
  },
  "Nutty taro flavor blended with milk for a sweet and velvety drink.": {
    es: "Sabor a taro mezclado con leche para una bebida dulce y aterciopelada."
  },
  "Earthy matcha and creamy milk balanced into a refreshing green tea latte.": {
    es: "Matcha terroso con leche cremosa en un refrescante latte de té verde."
  },
  "Caramel-like brown sugar syrup mixed into creamy milk tea.": {
    es: "Jarabe de azúcar morena con sabor a caramelo mezclado con té de leche."
  },
  "Light green tea and milk with a mellow honey sweetness.": {
    es: "Té verde ligero con leche y un toque suave de miel."
  },
  "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.": {
    es: "Jarabe tradicional de melón de invierno con té de leche y dulzor tostado."
  },
  "A coffee-forward milk tea with creamy body and a gentle caffeine kick.": {
    es: "Té de leche con sabor a café, cuerpo cremoso y un toque de cafeína."
  },
  "Crisp green tea with juicy mango flavor for a bright tropical sip.": {
    es: "Té verde refrescante con sabor a mango jugoso."
  },
  "Fruity strawberry tea that is sweet, vibrant, and refreshing.": {
    es: "Té de fresa afrutado, dulce y refrescante."
  },
  "Classic black tea infused with ripe peach flavor.": {
    es: "Té negro clásico infusionado con sabor a durazno maduro."
  },
  "Floral oolong tea paired with delicate lychee sweetness.": {
    es: "Té oolong floral combinado con dulzor delicado de lichi."
  }
};

function CustomerKiosk() {
  const [language, setLanguage] = useState("en");

  const t = (key) => {
    if (language === "en") return key;
    return TRANSLATIONS[key]?.es || key;
  };
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1.2);
  const [speakMode, setSpeakMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: t(
        "Hi, I am Boba Buddy! Tell me the weather, any allergies or diet needs, and I will recommend a drink."
      )
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const itemRefs = useRef([]);
  const categoryRefs = useRef([]);
  const synth = window.speechSynthesis;

  const normalizeName = (value = "") =>
    value.toLowerCase().trim().replace(/\s+/g, " ");

  const localImageByName = {
    "classic milk tea": "/images/menu/classic_milk_tea.png",
    "thai milk tea": "/images/menu/thai_milk_tea.png",
    "taro milk tea": "/images/menu/taro_milk_tea.png",
    "matcha milk tea": "/images/menu/matcha_milk_tea.png",
    "okinawa brown sugar milk tea": "/images/menu/okinawa_brown_sugar_milk_tea.png",
    "honey green milk tea": "/images/menu/honey_green_milk_tea.png",
    "wintermelon milk tea": "/images/menu/wintermelon_milk_tea.png",
    "winter melon milk tea": "/images/menu/wintermelon_milk_tea.png",
    "coffee milk tea": "/images/menu/coffee_milk_tea.png",
    "mango green tea": "/images/menu/mango_green_tea.png",
    "strawberry fruit tea": "/images/menu/strawberry_fruit_tea.png",
    "peach black tea": "/images/menu/peach_black_tea.png",
    "lychee oolong tea": "/images/menu/lychee_oolong_tea.png",
    "additional boba": "/images/menu/additional_boba.png"
  };

  const generatedDescriptionByName = {
    "classic milk tea":
      "Smooth black tea with creamy milk for a rich, classic boba taste.",
    "thai milk tea":
      "Bold Thai tea with sweet cream notes and a fragrant spiced finish.",
    "taro milk tea":
      "Nutty taro flavor blended with milk for a sweet and velvety drink.",
    "matcha milk tea":
      "Earthy matcha and creamy milk balanced into a refreshing green tea latte.",
    "okinawa brown sugar milk tea":
      "Caramel-like brown sugar syrup mixed into creamy milk tea.",
    "honey green milk tea":
      "Light green tea and milk with a mellow honey sweetness.",
    "wintermelon milk tea":
      "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.",
    "winter melon milk tea":
      "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.",
    "coffee milk tea":
      "A coffee-forward milk tea with creamy body and a gentle caffeine kick.",
    "mango green tea":
      "Crisp green tea with juicy mango flavor for a bright tropical sip.",
    "strawberry fruit tea":
      "Fruity strawberry tea that is sweet, vibrant, and refreshing.",
    "peach black tea":
      "Classic black tea infused with ripe peach flavor.",
    "lychee oolong tea":
      "Floral oolong tea paired with delicate lychee sweetness.",
    "additional boba":
      "Chewy tapioca pearls to add extra texture to your drink."
  };

  const placeholderSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420"><rect width="100%" height="100%" fill="#f5c4a1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5c3d2e" font-size="28" font-family="Arial, sans-serif">Boba Bytes</text></svg>'
    );

  const getItemImageSrc = (item) => {
    const normalized = normalizeName(item.item_name);
    const localImage = localImageByName[normalized];
    if (localImage) return localImage;
    if (item.image) return item.image;
    return placeholderSvg;
  };

  const getTranslatedDrinkName = (item) => {
    const key = normalizeName(item.item_name);
    if (language === "es" && TRANSLATIONS[key]?.es) {
      return TRANSLATIONS[key].es;
    }
    return item.item_name;
  };

  const getItemDescription = (item) => {
    const english = item.item_description?.trim()
      ? item.item_description
      : generatedDescriptionByName[normalizeName(item.item_name)];

    if (language === "es" && TRANSLATIONS[english]?.es) {
      return TRANSLATIONS[english].es;
    }
    return english;
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

        const translatedCats =
          language === "es"
            ? ["Todos", ...cats.filter((c) => c !== "Toppings")]
            : ["All", ...cats.filter((c) => c !== "Toppings")];

        setCategories(translatedCats);
      } catch (error) {
        alert(t("Network error"));
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [language]);

  const browseableMenuItems = menuItems.filter((item) => item.item_type !== "Toppings");

  const filteredItems =
    selectedCategory === "All" || selectedCategory === "Todos"
      ? browseableMenuItems
      : browseableMenuItems.filter((item) => {
          if (language === "es") {
            return (
              TRANSLATIONS[item.item_type]?.es === selectedCategory ||
              item.item_type === selectedCategory
            );
          }
          return item.item_type === selectedCategory;
        });

  const drinksMatch = (a, b) => {
    const aT = (a.toppings || [])
      .map((t) => t.name)
      .sort((x, y) => x.localeCompare(y));
    const bT = (b.toppings || [])
      .map((t) => t.name)
      .sort((x, y) => x.localeCompare(y));

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

    setCustomModalOpen(true);
  };

  const handleItemClick = (item) => {
    openCustomization(item);
  };

  const computeToppingsCostPerDrink = (toppings) =>
    (toppings || []).reduce((sum, t) => sum + Number(t.price), 0);

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
      size: selectedSize || "Medium",
      ice: selectedIce || "Regular Ice",
      sugar: selectedSugar || "100%",
      toppings: selectedToppings,
      quantity: editingIndex !== null ? cart[editingIndex].quantity : 1,
      base_cost: basePrice,
      toppings_cost_per_drink: toppingsCost
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
    const perDrink =
      Number(item.base_cost) + computeToppingsCostPerDrink(item.toppings);
    return total + perDrink * item.quantity;
  }, 0);
  const submitOrder = async () => {
    if (cart.length === 0) return;
    speak(t("Order submitted successfully"));

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_type: "kiosk",
          items: cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity
          })),
          total: totalPrice
        })
      });

      if (response.ok) {
        alert(t("Order submitted successfully"));
        setCart([]);
      } else {
        alert(t("Failed to submit order"));
      }
    } catch (error) {
      alert(t("Network error"));
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

      if (e.key === "ArrowDown") {
        if (activeCategory !== -1) {
          setFocusIndex(0);
          itemRefs.current[0]?.focus();
          return;
        }
        if (focusIndex < totalItems - 1) setFocusIndex(focusIndex + 1);
      }

      if (e.key === "ArrowUp") {
        if (focusIndex > 0) setFocusIndex(focusIndex - 1);
        else categoryRefs.current[0]?.focus();
      }

      if (e.key === "ArrowLeft") {
        if (activeCategory > 0) categoryRefs.current[activeCategory - 1]?.focus();
      }

      if (e.key === "ArrowRight") {
        if (activeCategory !== -1 && activeCategory < totalCategories - 1)
          categoryRefs.current[activeCategory + 1]?.focus();
      }

      if (e.key === "Enter") {
        if (activeCategory !== -1) {
          const cat = categories[activeCategory];
          setSelectedCategory(cat);
          speak(`${t("Category")}: ${cat}`);
          return;
        }
        const item = filteredItems[focusIndex];
        handleItemClick(item);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyboardMode, filteredItems, focusIndex, categories, language]);

  useEffect(() => {
    if (keyboardMode && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].focus();
      itemRefs.current[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [focusIndex, keyboardMode]);

  const isToppingSelected = (name) =>
    selectedToppings.some((t) => t.name === name);

  const toggleTopping = (name) => {
    setSelectedToppings((prev) => {
      if (prev.some((t) => t.name === name)) {
        return prev.filter((t) => t.name !== name);
      }
      const price = getToppingPriceByName(name);
      return [...prev, { name, price }];
    });
  };

  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newMessages = [...chatMessages, { role: "user", content: trimmed }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          menu: menuItems
        })
      });

      const data = await res.json();

      if (data && data.reply) {
        setChatMessages((prev) => [...prev, data.reply]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("Sorry, I had trouble answering. Please try again.")
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };
  if (loading) return <div className="kiosk-loading">Loading menu...</div>;

  return (
    <div className="kiosk-container" style={{ "--scale": fontScale }}>
      <header className="kiosk-top-header">
        <div className="kiosk-header-small">
          <h1>{t("Boba Bytes")}</h1>

          <div className="kiosk-header-actions">
            <div className="category-bar">
              {categories.map((cat, index) => (
                <button
                  key={cat ?? index}
                  ref={(el) => (categoryRefs.current[index] = el)}
                  tabIndex={keyboardMode ? 0 : -1}
                  onClick={() => {
                    setSelectedCategory(cat);
                    speak(`${t("Category")}: ${cat}`);
                  }}
                  className={`category-btn ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                  aria-label={`${t("Select category")} ${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="accessibility-bar">
              <label>{t("Text Size")}:</label>

              <button
                className="size-btn"
                onClick={() =>
                  setFontScale((prev) => Math.max(0.6, prev - 0.1))
                }
                aria-label={t("Decrease text size")}
              >
                -
              </button>

              <button
                className="size-btn"
                onClick={() =>
                  setFontScale((prev) => Math.min(1.6, prev + 0.1))
                }
                aria-label={t("Increase text size")}
              >
                +
              </button>

              <button
                className={`access-btn ${speakMode ? "active" : ""}`}
                onClick={() => {
                  setSpeakMode(!speakMode);
                  speak(
                    !speakMode
                      ? t("Speaker On")
                      : t("Speaker Off")
                  );
                }}
              >
                {speakMode ? t("Speaker On") : t("Speaker Off")}
              </button>

              <button
                className={`access-btn ${keyboardMode ? "active" : ""}`}
                onClick={() => {
                  setKeyboardMode(!keyboardMode);
                  speak(
                    !keyboardMode
                      ? t("Keyboard On")
                      : t("Keyboard Off")
                  );
                }}
              >
                {keyboardMode ? t("Keyboard On") : t("Keyboard Off")}
              </button>

              <button
                className={`access-btn ${language === "es" ? "active" : ""}`}
                onClick={() => setLanguage((prev) => (prev === "en" ? "es" : "en"))}
              >
                {language === "en" ? "Español" : "English"}
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
              className={`menu-card ${
                keyboardMode && focusIndex === index ? "focused" : ""
              }`}
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={keyboardMode ? 0 : -1}
              aria-label={`${t("Add")} ${getTranslatedDrinkName(item)} ${t("to cart")}`}
            >
              <img
                src={getItemImageSrc(item)}
                alt={getTranslatedDrinkName(item)}
                className="item-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderSvg;
                }}
              />

              <div className="item-info">
                <h3>{getTranslatedDrinkName(item)}</h3>
                <p className="item-description">{getItemDescription(item)}</p>
                <p className="price">${Number(item.item_cost).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-sidebar" aria-live="polite">
          <h2>
            {t("Your Cart")} ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <p className="empty-cart">{t("Tap any drink to start your order")}</p>
          ) : (
            cart.map((item, index) => {
              const perDrink =
                Number(item.base_cost) +
                computeToppingsCostPerDrink(item.toppings);

              return (
                <div key={item.cart_item_id} className="cart-item">
                  <div
                    style={{ flex: 1 }}
                    onClick={() => openCustomization(item, index)}
                  >
                    <div>
                      <span>{getTranslatedDrinkName(item)}</span>
                      <span className="qty"> x {item.quantity}</span>
                    </div>

                    <div className="topping-items">
                      <div>
                        {t("Size")}: {item.size}
                      </div>
                      <div>
                        {t("Ice")}: {item.ice}
                      </div>
                      <div>
                        {t("Sugar")}: {item.sugar}
                      </div>

                      {item.toppings &&
                        item.toppings.length > 0 &&
                        item.toppings.map((t, idx) => (
                          <div key={idx}>+ {t.name}</div>
                        ))}
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <span>${(perDrink * item.quantity).toFixed(2)}</span>

                    <button
                      onClick={() => duplicateDrink(item.cart_item_id)}
                      className="remove-btn"
                      aria-label={`${t("Duplicate")} ${getTranslatedDrinkName(item)}`}
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      className="remove-btn"
                      aria-label={`${t("Remove")} ${getTranslatedDrinkName(item)}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <div className="cart-total">
            <span>{t("Total")}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={submitOrder}
            className="submit-order-btn"
            disabled={cart.length === 0}
          >
            {t("Place Order")}
          </button>
        </div>
      </div>
      {customModalOpen && currentDrink && (
        <div className="topping-modal-overlay">
          <div className="topping-modal-content">
            <h2>
              {t("Customize")} {getTranslatedDrinkName(currentDrink)}
            </h2>

            <div className="custom-section">
              <label>{t("Size")}</label>
              <div className="option-group">
                {["Small", "Medium", "Large"].map((s) => (
                  <button
                    key={s}
                    className={`option-btn ${selectedSize === s ? "active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>{t("Ice")}</label>
              <div className="option-group">
                {["No Ice", "Less Ice", "Regular Ice", "Extra Ice"].map((i) => (
                  <button
                    key={i}
                    className={`option-btn ${selectedIce === i ? "active" : ""}`}
                    onClick={() => setSelectedIce(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>{t("Sugar")}</label>
              <div className="option-group">
                {["0%", "25%", "50%", "75%", "100%"].map((s) => (
                  <button
                    key={s}
                    className={`option-btn ${selectedSugar === s ? "active" : ""}`}
                    onClick={() => setSelectedSugar(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>{t("Toppings")}</label>
              <div className="topping-checkbox-list">
                {TOPPINGS.map((t) => (
                  <button
                    type="button"
                    key={t.name}
                    className={`topping-checkbox-row ${
                      isToppingSelected(t.name) ? "selected" : ""
                    }`}
                    onClick={() => toggleTopping(t.name)}
                  >
                    <span>{t.name}</span>
                    <span className="topping-checkbox-price">
                      +${t.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button className="confirm-btn" onClick={saveDrink}>
              {editingIndex !== null ? t("Save Changes") : t("Add to Cart")}
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setCustomModalOpen(false);
                setEditingIndex(null);
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
      <div
        className="chatbot-button"
        onClick={() => setChatOpen(true)}
      >
        <img src="/images/chatbot.png" alt="Chatbot" />
      </div>

      {chatOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <span>Boba Buddy</span>
            <button onClick={() => setChatOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "msg-user" : "msg-bot"}
              >
                {m.content}
              </div>
            ))}

            {chatLoading && (
              <div className="msg-bot">
                {t("Thinking of a drink for you...")}
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t("Tell me the weather, allergies, diet ...")}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChatMessage();
              }}
            />

            <button onClick={sendChatMessage}>
              {t("Send")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerKiosk;
