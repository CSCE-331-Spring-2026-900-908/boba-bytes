import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

const emptyForm = {
    item_name: "",
    quantity: "",
    unit_of_measure: "",
    item_cost: "",
    threshold_count: "",
    last_order_date: ""
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

export default function InventoryManagement() {
    const [inventory, setInventory] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);

    const loadInventory = async () => {
        try {
            const response = await fetch(`${API_BASE}/inventory`);
            if (!response.ok) {
                throw new Error("Failed to load inventory data.");
            }

            const data = await parseJsonSafe(response);
            setInventory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load inventory:", err);
        }
    };

    useEffect(() => {
        loadInventory();
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
        if (!form.item_name || !form.quantity || !form.unit_of_measure || !form.item_cost) {
            alert("Please fill in item name, quantity, unit, and item cost.");
            return;
        }

        if (Number(form.quantity) < 0 || Number(form.item_cost) < 0) {
            alert("Quantity and item cost must be non-negative.");
            return;
        }

        if (form.threshold_count !== "" && Number(form.threshold_count) < 0) {
            alert("Threshold count must be non-negative.");
            return;
        }

        const payload = {
            item_name: form.item_name,
            quantity: Number(form.quantity),
            unit_of_measure: form.unit_of_measure,
            item_cost: Number(form.item_cost),
            threshold_count: form.threshold_count === "" ? null : Number(form.threshold_count),
            last_order_date: form.last_order_date || null
        };

        try {
            let response;

            if (selected) {
                response = await fetch(`${API_BASE}/inventory/${selected.inv_item_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_BASE}/inventory`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            const responseData = await parseJsonSafe(response);
            if (!response.ok) {
                throw new Error(responseData?.error || "Error saving inventory item.");
            }

            resetForm();
            loadInventory();
        } catch (err) {
            console.error("Failed to save inventory item:", err);
            alert(err.message || "Error saving inventory item.");
        }
    };

    const handleEdit = (item) => {
        setSelected(item);
        setForm({
            item_name: item.item_name ?? "",
            quantity: item.quantity ?? "",
            unit_of_measure: item.unit_of_measure ?? "",
            item_cost: item.item_cost ?? "",
            threshold_count: item.threshold_count ?? "",
            last_order_date: item.last_order_date ? String(item.last_order_date).slice(0, 10) : ""
        });
        setShowForm(true);
    };

    const handleDelete = async (invItemId) => {
        if (!window.confirm("Are you sure you want to delete this inventory item?")) return;

        try {
            const response = await fetch(`${API_BASE}/inventory/${invItemId}`, { method: "DELETE" });
            if (!response.ok) {
                const data = await parseJsonSafe(response);
                throw new Error(data?.error || "Error deleting inventory item.");
            }

            loadInventory();
        } catch (err) {
            console.error("Failed to delete inventory item:", err);
            alert(err.message || "Error deleting inventory item.");
        }
    };

    const sortedInventory = [...inventory].sort((a, b) => Number(a.inv_item_id) - Number(b.inv_item_id));

    return (
        <div className="inv-management">
            <div className="inv-header">
                <h2>Inventory Management</h2>
                <button
                    className="btn-add"
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + Add Inventory Item
                </button>
            </div>

            <span className="item-count">
                {inventory.length} inventory item{inventory.length !== 1 ? "s" : ""}
            </span>

            {showForm && (
                <div className="inv-form">
                    <h3>{selected ? "Edit Inventory Item" : "Add New Inventory Item"}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Item Name *</label>
                            <input
                                name="item_name"
                                placeholder="e.g. Tapioca Pearls"
                                value={form.item_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity *</label>
                            <input
                                name="quantity"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g. 20"
                                value={form.quantity}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit of Measure *</label>
                            <input
                                name="unit_of_measure"
                                placeholder="e.g. lbs, oz, cups"
                                value={form.unit_of_measure}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Item Cost ($) *</label>
                            <input
                                name="item_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g. 12.50"
                                value={form.item_cost}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Threshold Count</label>
                            <input
                                name="threshold_count"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g. 5"
                                value={form.threshold_count}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Order Date</label>
                            <input
                                name="last_order_date"
                                type="date"
                                value={form.last_order_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-save" type="button" onClick={handleSubmit}>
                            {selected ? "Save Changes" : "Add Item"}
                        </button>
                        <button className="btn-cancel" type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <table className="inv-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Threshold</th>
                        <th>Unit</th>
                        <th>Cost per unit</th>
                        <th>Last Order Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedInventory.map(item => (
                        <tr key={item.inv_item_id}>
                            <td>{item.inv_item_id}</td>
                            <td>{item.item_name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.threshold_count}</td>
                            <td>{item.unit_of_measure}</td>
                            <td>{item.item_cost}</td>
                            <td>{item.last_order_date.slice(0, 10)}</td>
                            <td className="action-buttons">
                                <button className="btn-edit" type="button" onClick={() => handleEdit(item)}>Edit</button>
                                <button className="btn-delete" type="button" onClick={() => handleDelete(item.inv_item_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {inventory.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty-row">No inventory items found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
