import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Portal() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-20">
            <h1 className="text-9xl font-black text-blue-600">Boba & Bytes</h1>
            <div className="flex flex-col items-center gap-6">
                <Link to="/login" state={{ role: "manager" }}>
                    <button
                        type="button"
                        className="px-10 py-5 rounded-4xl font-mono bg-red-950 text-white hover:bg-red-900 hover:scale-105 text-5xl transition-all ease-in-out duration-200"
                    >
                        Manager Interface
                    </button>
                </Link>
                <Link to="/login" state={{ role: "cashier" }}>
                    <button
                        type="button"
                        className="px-10 py-5 rounded-4xl font-mono bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 text-5xl transition-all ease-in-out duration-200"
                    >
                        Cashier Interface
                    </button>
                </Link>

                <Link to="/customer">
                    <button
                        type="button"
                        className="px-10 py-5 rounded-4xl font-mono bg-amber-600 text-white hover:bg-amber-500 hover:scale-105 text-5xl transition-all ease-in-out duration-200"
                    >
                        Customer Kiosk
                    </button>
                </Link>
            </div>
        </div>
    );
}