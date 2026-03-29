import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Portal() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-10 scale scale-300">
            <h1 className="text-4xl font-black text-blue-600">Boba & Bytes</h1>
            <div className="flex flex-col items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/manager")}
                    className="px-4 py-2 rounded font-mono bg-blue-500 text-white hover:bg-blue-600"
                >
                    Manager Interface
                </button>

                <Link to="/cashier">
                    <button
                        type="button"
                        className="px-4 py-2 rounded font-mono bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                        Cashier Interface
                    </button>
                </Link>

                <Link to="/customer">
                    <button
                        type="button"
                        className="px-4 py-2 rounded font-mono bg-purple-500 text-white hover:bg-purple-600"
                    >
                        Customer Kiosk
                    </button>
                </Link>
            </div>
        </div>
    );
}