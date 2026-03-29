import React, { useEffect, useState } from "react";

export default function InventoryManagement() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        fetch("/api/inventory")
            .then(res => res.json())
            .then(data => setInventory(data));
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
