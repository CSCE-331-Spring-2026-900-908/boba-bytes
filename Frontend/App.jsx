import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Portal from "./pages/Login/Portal.jsx";
import Login from "./pages/Login/Login.jsx";
import ManagerPage from "./pages/Manager/ManagerPage.jsx";
//import ProtectedRoute from "./ProtectedRoute.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Portal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/manager" element={ <ManagerPage /> } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

