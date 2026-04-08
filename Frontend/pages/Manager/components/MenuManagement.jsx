import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

const emptyForm = {
    item_name: "",
    item_cost: "",
    item_type: "",
    image: ""
};

export default function MenuManagement() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filterCategory, setFilterCategory] = useState("All");
    const [showForm, setShowForm] = useState(false);

    const loadMenu = async () => {
        try {
            const [itemsRes, catsRes] = await Promise.all([
                fetch(`${API_BASE}/menu/items`),
                fetch(`${API_BASE}/menu/categories`)
            ]);
            const itemsData = await itemsRes.json();
            const catsData = await catsRes.json();
            setItems(itemsData);
            setCategories(catsData);
        } catch (err) {
            console.error("Failed to load menu:", err);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setSelected(null);
        setShowForm(false);
    };

    const handleSubmit = async () => {
        if (!form.item_name || !form.item_cost || !form.item_type) {
            alert("Please fill in name, price, and category.");
            return;
        }

        const payload = {
            item_name: form.item_name,
            item_cost: parseFloat(form.item_cost),
            item_type: form.item_type,
            image: form.image || null
        };

        try {
            if (selected) {
                await fetch(`${API_BASE}/menu/items/${selected.menu_item_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_BASE}/menu/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }
            resetForm();
            loadMenu();
        } catch (err) {
            console.error("Failed to save menu item:", err);
            alert("Error saving menu item.");
        }
    };

    const handleEdit = (item) => {
        setSelected(item);
        setForm({
            item_name: item.item_name,
            item_cost: item.item_cost,
            item_type: item.item_type,
            image: item.image || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (menuItemId) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) return;

        try {
            await fetch(`${API_BASE}/menu/items/${menuItemId}`, { method: "DELETE" });
            loadMenu();
        } catch (err) {
            console.error("Failed to delete menu item:", err);
            alert("Error deleting menu item.");
        }
    };

    const filteredItems = filterCategory === "All"
        ? items
        : items.filter(item => item.item_type === filterCategory);

    return (
        <div className="menu-management">
            <div className="menu-header">
                <h2>Menu Management</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + Add Menu Item
                </button>
            </div>

            <div className="menu-filter">
                <label>Filter by category: </label>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">All</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <span className="item-count">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</span>
            </div>

            {showForm && (
                <div className="menu-form">
                    <h3>{selected ? "Edit Menu Item" : "Add New Menu Item"}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Item Name *</label>
                            <input
                                name="item_name"
                                placeholder="e.g. Classic Milk Tea"
                                value={form.item_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Price ($) *</label>
                            <input
                                name="item_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g. 5.99"
                                value={form.item_cost}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <input
                                name="item_type"
                                placeholder="e.g. Milk Tea"
                                value={form.item_type}
                                onChange={handleChange}
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                {categories.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                name="image"
                                placeholder="https://example.com/image.png"
                                value={form.image}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-save" onClick={handleSubmit}>
                            {selected ? "Save Changes" : "Add Item"}
                        </button>
                        <button className="btn-cancel" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <table className="menu-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.menu_item_id}>
                            <td>{item.menu_item_id}</td>
                            <td>{item.item_name}</td>
                            <td>${Number(item.item_cost).toFixed(2)}</td>
                            <td>
                                <span className="category-badge">{item.item_type}</span>
                            </td>
                            <td>
                                {item.image ? (
                                    <img src={item.image} alt={item.item_name} className="menu-thumb" />
                                ) : (
                                    <span className="no-image">—</span>
                                )}
                            </td>
                            <td className="action-buttons">
                                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(item.menu_item_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty-row">No menu items found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
