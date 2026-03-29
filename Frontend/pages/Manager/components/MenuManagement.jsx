import React, { useEffect, useState } from "react";

export default function MenuManagement() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("/api/menu")
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    return (
        <div>
            <h2>Menu Management</h2>
            <button>Add Menu Item</button>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>${item.price}</td>
                            <td>{item.category}</td>
                            <td>
                                <button>Edit</button>
                                <button>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
