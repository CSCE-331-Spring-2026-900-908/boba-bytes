export default function Sidebar({ setTab }) {
    return (
        <div className="sidebar">
            <button onClick={() => setTab("employees")}>Employees</button>
            <button onClick={() => setTab("menu")}>Menu Items</button>
            <button onClick={() => setTab("inventory")}>Inventory</button>
            <button onClick={() => setTab("reports")}>Reports</button>
            <button onClick={() => setTab("recommendations")}>Recommendations</button>
        </div>
    );
}
