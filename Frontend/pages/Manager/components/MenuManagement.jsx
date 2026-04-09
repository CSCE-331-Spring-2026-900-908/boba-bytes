import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

const emptyForm = {
    item_name: "",
    item_cost: "",
    item_type: ""
};

const emptyRecipeRow = {
    inventory_id: "",
    quantity: ""
};

const parseJsonSafe = async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

export default function MenuManagement() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [recipeRows, setRecipeRows] = useState([{ ...emptyRecipeRow }]);
    const [filterCategory, setFilterCategory] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

    const getInventoryId = (item) => item.id ?? item.inventory_id ?? item.inventory_item_id ?? item.inv_item_id;
    const getInventoryName = (item) => item.name ?? item.inventory_name ?? item.item_name ?? `Inventory #${getInventoryId(item)}`;
    const getInventoryUnit = (item) => item.unit ?? item.inventory_unit ?? item.unit_of_measure;
    const sortedInventory = [...inventory].sort((a, b) =>
        getInventoryName(a).localeCompare(getInventoryName(b))
    );

    const loadMenu = async () => {
        try {
            const [itemsRes, catsRes, inventoryRes] = await Promise.all([
                fetch(`${API_BASE}/menu/items`),
                fetch(`${API_BASE}/menu/categories`),
                fetch(`${API_BASE}/inventory`)
            ]);

            if (!itemsRes.ok || !catsRes.ok || !inventoryRes.ok) {
                throw new Error("Failed to load menu, categories, or inventory data.");
            }

            const itemsData = await parseJsonSafe(itemsRes);
            const catsData = await parseJsonSafe(catsRes);
            const inventoryData = await parseJsonSafe(inventoryRes);
            setItems(Array.isArray(itemsData) ? itemsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
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
        setRecipeRows([{ ...emptyRecipeRow }]);
        setIsLoadingRecipe(false);
        setShowForm(false);
    };

    const addRecipeRow = () => {
        setRecipeRows((prev) => [...prev, { ...emptyRecipeRow }]);
    };

    const removeRecipeRow = (index) => {
        setRecipeRows((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length ? next : [{ ...emptyRecipeRow }];
        });
    };

    const handleRecipeChange = (index, field, value) => {
        setRecipeRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleSubmit = async () => {
        if (!form.item_name || !form.item_cost || !form.item_type) {
            alert("Please fill in name, price, and category.");
            return;
        }

        const invalidRecipe = recipeRows.some((row) => {
            const hasIngredient = row.inventory_id !== "";
            const hasQuantity = row.quantity !== "";
            return hasIngredient !== hasQuantity;
        });

        if (invalidRecipe) {
            alert("Each recipe row must include both an ingredient and quantity.");
            return;
        }

        const recipe = recipeRows
            .filter((row) => row.inventory_id !== "" && row.quantity !== "")
            .map((row) => ({
                inventory_id: Number(row.inventory_id),
                quantity: Number(row.quantity)
            }))
            .filter((row) => Number.isInteger(row.inventory_id) && row.inventory_id > 0 && row.quantity > 0);

        if (recipeRows.some((row) => row.quantity !== "" && Number(row.quantity) <= 0)) {
            alert("Recipe quantity must be greater than 0.");
            return;
        }

        const payload = {
            item_name: form.item_name,
            item_cost: parseFloat(form.item_cost),
            item_type: form.item_type,
            recipe
        };

        try {
            let response;
            if (selected) {
                response = await fetch(`${API_BASE}/menu/items/${selected.menu_item_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_BASE}/menu/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            const responseData = await parseJsonSafe(response);
            if (!response.ok) {
                throw new Error(responseData?.error || "Error saving menu item.");
            }

            resetForm();
            loadMenu();
        } catch (err) {
            console.error("Failed to save menu item:", err);
            alert(err.message || "Error saving menu item.");
        }
    };

    const handleEdit = async (item) => {
        setSelected(item);
        setForm({
            item_name: item.item_name,
            item_cost: item.item_cost,
            item_type: item.item_type
        });
        setShowForm(true);

        setIsLoadingRecipe(true);
        try {
            const recipeRes = await fetch(`${API_BASE}/menu/items/${item.menu_item_id}/recipe`);
            if (!recipeRes.ok) {
                throw new Error("Could not load recipe for this item.");
            }

            const recipeData = await parseJsonSafe(recipeRes);
            if (Array.isArray(recipeData) && recipeData.length > 0) {
                setRecipeRows(
                    recipeData.map((row) => ({
                        inventory_id: String(row.inventory_id ?? ""),
                        quantity: String(row.quantity ?? "")
                    }))
                );
            } else {
                setRecipeRows([{ ...emptyRecipeRow }]);
            }
        } catch (err) {
            console.error("Failed to load recipe:", err);
            setRecipeRows([{ ...emptyRecipeRow }]);
            alert("Could not load recipe for this item.");
        } finally {
            setIsLoadingRecipe(false);
        }
    };

    const handleDelete = async (menuItemId) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) return;

        try {
            const response = await fetch(`${API_BASE}/menu/items/${menuItemId}`, { method: "DELETE" });
            if (!response.ok) {
                const data = await parseJsonSafe(response);
                throw new Error(data?.error || "Error deleting menu item.");
            }
            loadMenu();
        } catch (err) {
            console.error("Failed to delete menu item:", err);
            alert(err.message || "Error deleting menu item.");
        }
    };

    const sortedItems = [...items].sort((a, b) => Number(a.menu_item_id) - Number(b.menu_item_id));
    const filteredItems = filterCategory === "All"
        ? sortedItems
        : sortedItems.filter(item => item.item_type === filterCategory);

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
                    </div>

                    <div className="recipe-section">
                        <div className="recipe-header-row">
                            <h4>Recipe</h4>
                            <button type="button" className="btn-add-ingredient" onClick={addRecipeRow}>
                                + Add Ingredient
                            </button>
                        </div>
                        <p className="recipe-help">Select inventory ingredients and quantity used per menu item.</p>
                        {sortedInventory.length === 0 && !isLoadingRecipe && (
                            <p className="recipe-help">No inventory items found. Add inventory items first to build a recipe.</p>
                        )}

                        {isLoadingRecipe ? (
                            <p className="recipe-help">Loading recipe...</p>
                        ) : (
                            <div className="recipe-grid">
                                {recipeRows.map((row, index) => (
                                    <div className="recipe-row" key={`${index}-${row.inventory_id}-${row.quantity}`}>
                                        <select
                                            value={row.inventory_id}
                                            onChange={(e) => handleRecipeChange(index, "inventory_id", e.target.value)}
                                        >
                                            <option value="">Select ingredient</option>
                                            {sortedInventory.map((item) => {
                                                const invId = getInventoryId(item);
                                                return (
                                                    <option key={invId} value={String(invId)}>
                                                        {getInventoryName(item)}
                                                        {getInventoryUnit(item) ? ` (${getInventoryUnit(item)})` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Qty"
                                            value={row.quantity}
                                            onChange={(e) => handleRecipeChange(index, "quantity", e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            className="btn-remove-ingredient"
                                            onClick={() => removeRecipeRow(index)}
                                            disabled={recipeRows.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            <td className="action-buttons">
                                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(item.menu_item_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty-row">No menu items found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}