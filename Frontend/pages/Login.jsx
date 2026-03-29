import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID",
            callback: handleLogin,
        });

        google.accounts.id.renderButton(
            document.getElementById("google-login"),
            { theme: "outline", size: "large" }
        );
    }, []);

    function handleLogin(response) {
        fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("managerAuth", "true");
                    navigate("/manager");
                }
            });
    }

    return (
        <div className="login-container">
            <h1>Manager Login</h1>
            <div id="google-login"></div>
        </div>
    );
}
