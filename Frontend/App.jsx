import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Portal from "./pages/Portal.jsx";
import Login from "./pages/Login.jsx";
import ManagerPage from "./pages/Manager/ManagerPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Portal />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/manager"
                    element={
                        <ProtectedRoute>
                            <ManagerPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

