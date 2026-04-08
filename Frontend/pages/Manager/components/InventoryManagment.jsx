import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

export default function InventoryManagement() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/inventory`)
            .then(res => res.json())
            .then(data => setInventory(data))
            .catch(err => console.error("Failed to load inventory:", err));
    }, []);

    return (
        <div>
            <h2>Inventory Management</h2>
            <button>Add Inventory Item</button>

            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {inventory.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>
                                <button>Edit</button>
                                <button>Restock</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
