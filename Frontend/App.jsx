import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Portal from "./pages/Portal/Portal.jsx";
import Login from "./pages/Login/Login.jsx";
import ManagerPage from "./pages/Manager/ManagerPage.jsx";
import CashierPage from "./pages/Cashier/CashierPage.jsx";
import CustomerKiosk from './pages/Customer/CustomerKiosk';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Portal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/manager" element={<ManagerPage />} />
                <Route path="/cashier" element={<CashierPage />} />
                <Route path="/customer" element={<CustomerKiosk />} />
                <Route path="/kiosk" element={<CustomerKiosk />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;