import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import EmployeeManagement from "./components/EmployeeManagment.jsx";
import MenuManagement from "./components/MenuManagement.jsx";
import InventoryManagement from "./components/InventoryManagment";
import Reports from "./components/Reports.jsx";
import "./Manager.css";
import Recommendations from "./components/Recommendations";

export default function ManagerPage() {
    const [tab, setTab] = useState("employees");

    return (
        <div className="manager-container">
            <Sidebar setTab={setTab} />

            <div className="manager-content">
                {tab === "employees" && <EmployeeManagement />}
                {tab === "menu" && <MenuManagement />}
                {tab === "inventory" && <InventoryManagement />}
                {tab === "reports" && <Reports />}
                {tab === "recommendations" && <Recommendations />}
            </div>
        </div>
    );
}
