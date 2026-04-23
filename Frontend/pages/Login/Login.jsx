import React, {useState} from "react";
import {useLocation, Link, useNavigate} from "react-router-dom";
import {API_BASE} from "../../config/api";
import {account, OAuthProvider} from "../../lib/appwrite";

export default function Login() {
    const navigate = useNavigate();
    const loc = useLocation();
    const roleLabel = loc.state?.role;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch(`${API_BASE}/login/${roleLabel}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({email, password})
        });

        const data = await response.json();

        if(data.success){
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate(roleLabel === "manager" ? "/manager" : "/cashier");
        }
        else{
            alert(data.error || "Invalid email or password.");
        }
    }

    const handleGoogleLogin = async () => {
        // Preserve the selected role across the OAuth redirect round-trip.
        sessionStorage.setItem("pendingRole", roleLabel || "");

        // Clear any stale session first so createSession on the callback doesn't fail with
        // "Creation of a session is prohibited when a session is active".
        try {
            await account.deleteSession("current");
        } catch {
            // No active session — that's fine.
        }

        // createOAuth2Token returns userId+secret as query params on the success URL.
        // We then create the session client-side (avoids third-party cookie issues on localhost).
        account.createOAuth2Token({
            provider: OAuthProvider.Google,
            success: `${window.location.origin}/oauth/success`,
            failure: `${window.location.origin}/login`,
        });
    };

    return (
        <main className="min-h-screen bg-slate-950 px-4 flex items-center justify-center text-slate-100">
            <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Login</p>
                    <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
                    <p className="mt-2 text-sm text-slate-400">Sign in to continue to your dashboard.</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400"
                    >
                        Sign in
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
                    <span className="h-px flex-1 bg-slate-800" />
                    or
                    <span className="h-px flex-1 bg-slate-800" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-100 transition hover:bg-slate-800"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path fill="#EA4335" d="M12 10.2v3.92h5.46c-.24 1.26-1.68 3.7-5.46 3.7-3.28 0-5.96-2.72-5.96-6.08S8.72 5.66 12 5.66c1.86 0 3.12.8 3.84 1.48l2.62-2.52C16.88 3.1 14.66 2.1 12 2.1 6.98 2.1 2.9 6.18 2.9 11.2S6.98 20.3 12 20.3c6.9 0 9.2-4.84 9.2-7.36 0-.5-.06-.88-.14-1.26H12z"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-5 text-center">
                    <Link to="/" className="text-sm text-slate-400 hover:text-emerald-400">
                        Back to portal
                    </Link>
                </div>
            </section>
        </main>
    );
}