import React, { useEffect, useState } from "react";

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        is_manager: false
    });

    const loadEmployees = async () => {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async () => {
        if (selected) {
            await fetch(`/api/employees/${selected.employee_no}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
        } else {
            await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
        }

        setForm({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            is_manager: false
        });
        setSelected(null);
        loadEmployees();
    };

    const handleEdit = (emp) => {
        setSelected(emp);
        setForm({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            is_manager: emp.is_manager,
            password: "" // never returned from backend
        });
    };

    const handleDelete = async (employee_no) => {
        await fetch(`/api/employees/${employee_no}`, {
            method: "DELETE"
        });
        loadEmployees();
    };

    return (
        <div>
            <h2>Employee Management</h2>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Manager?</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.employee_no}>
                            <td>{emp.first_name} {emp.last_name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.is_manager ? "Yes" : "No"}</td>
                            <td>
                                <button onClick={() => handleEdit(emp)}>Edit</button>
                                <button onClick={() => handleDelete(emp.employee_no)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: "20px" }}>
                <h3>{selected ? "Edit Employee" : "Add Employee"}</h3>

                <input
                    name="first_name"
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={handleChange}
                />

                <input
                    name="last_name"
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={handleChange}
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                {!selected && (
                    <input
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />
                )}

                <label>
                    <input
                        type="checkbox"
                        name="is_manager"
                        checked={form.is_manager}
                        onChange={handleChange}
                    />
                    Manager?
                </label>

                <button onClick={handleSubmit}>
                    {selected ? "Save Changes" : "Add Employee"}
                </button>
            </div>
        </div>
    );
}
