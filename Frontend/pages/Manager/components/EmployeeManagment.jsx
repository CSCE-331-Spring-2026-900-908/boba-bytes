import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    is_manager: false
};

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);

    const loadEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE}/employees`);
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            console.error("Failed to load employees:", err);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setSelected(null);
        setShowForm(false);
    };

    const handleSubmit = async () => {
        if (!form.first_name || !form.last_name || !form.email) {
            alert("Please fill in first name, last name, and email.");
            return;
        }
        if (!selected && !form.password) {
            alert("Password is required for new employees.");
            return;
        }

        try {
            if (selected) {
                const payload = {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    is_manager: form.is_manager
                };
                await fetch(`${API_BASE}/employees/${selected.employee_no}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_BASE}/employees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });
            }
            resetForm();
            loadEmployees();
        } catch (err) {
            console.error("Failed to save employee:", err);
            alert("Error saving employee.");
        }
    };

    const handleEdit = (emp) => {
        setSelected(emp);
        setForm({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            is_manager: emp.is_manager,
            password: ""
        });
        setShowForm(true);
    };

    const handleDelete = async (employee_no) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;

        try {
            await fetch(`${API_BASE}/employees/${employee_no}`, { method: "DELETE" });
            loadEmployees();
        } catch (err) {
            console.error("Failed to delete employee:", err);
            alert("Error deleting employee.");
        }
    };

    return (
        <div className="emp-management">
            <div className="emp-header">
                <h2>Employee Management</h2>
                <button
                    className="btn-add"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    + Add Employee
                </button>
            </div>

            <span className="item-count">
                {employees.length} employee{employees.length !== 1 ? "s" : ""}
            </span>

            {showForm && (
                <div className="emp-form">
                    <h3>{selected ? "Edit Employee" : "Add New Employee"}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                name="first_name"
                                placeholder="e.g. Jane"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name *</label>
                            <input
                                name="last_name"
                                placeholder="e.g. Doe"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="e.g. jane@bobabytes.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        {!selected && (
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div className="form-group form-group-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_manager"
                                    checked={form.is_manager}
                                    onChange={handleChange}
                                />
                                Manager privileges
                            </label>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-save" onClick={handleSubmit}>
                            {selected ? "Save Changes" : "Add Employee"}
                        </button>
                        <button className="btn-cancel" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <table className="emp-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.employee_no}>
                            <td>{emp.employee_no}</td>
                            <td>{emp.first_name} {emp.last_name}</td>
                            <td>{emp.email}</td>
                            <td>
                                <span className={`role-badge ${emp.is_manager ? "role-manager" : "role-employee"}`}>
                                    {emp.is_manager ? "Manager" : "Employee"}
                                </span>
                            </td>
                            <td className="action-buttons">
                                <button className="btn-edit" onClick={() => handleEdit(emp)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(emp.employee_no)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {employees.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty-row">No employees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
