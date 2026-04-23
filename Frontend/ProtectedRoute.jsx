import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./lib/appwrite";

export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking"); // "checking" | "authed" | "guest"

    useEffect(() => {
        let cancelled = false;
        getCurrentUser().then(user => {
            if (cancelled) return;
            setStatus(user ? "authed" : "guest");
        });
        return () => { cancelled = true; };
    }, []);

    if (status === "checking") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading…
            </div>
        );
    }

    if (status === "guest") {
        return <Navigate to="/login" replace />;
    }

    return children;
}
