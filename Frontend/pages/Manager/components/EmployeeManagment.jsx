import React, { useEffect, useState } from "react";

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetch("/api/employees")
            .then(res => res.json())
            .then(data => setEmployees(data));
    }, []);

    return (
        <div>
            <h2>Employee Management</h2>
            <button>Add Employee</button>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.name}</td>
                            <td>{emp.role}</td>
                            <td>{emp.active ? "Active" : "Inactive"}</td>
                            <td>
                                <button>Edit</button>
                                <button>Deactivate</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
