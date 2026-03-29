import React from "react";
import { Link } from "react-router-dom";
import "./Portal.css";

export default function Portal() {
    return (
        <div className="portal-container">
            <h1>Portal</h1>

            <div className="portal-buttons">
                <Link to="/manager">
                    <button className="portal-btn">Manager Interface</button>
                </Link>

                <Link to="/cashier">
                    <button className="portal-btn">Cashier Interface</button>
                </Link>

                <Link to="/customer">
                    <button className="portal-btn">Customer Kiosk</button>
                </Link>
            </div>
        </div>
    );
}
