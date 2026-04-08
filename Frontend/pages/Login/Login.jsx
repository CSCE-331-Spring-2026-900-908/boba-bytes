import React, {useState} from "react";
import { useLocation, Link } from "react-router-dom";

export default function Login() {
    const loc = useLocation();
    const roleLabel = loc.state?.role;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("https://boba-bytes-production.up.railway.app/api/login}", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({email, password})
        });

        const data = await response.json();

        if(data.success){
            console.log("success");
        }
        else{
            console.log("invalid cred");
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 flex items-center justify-center text-slate-100">
            <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Login</p>
                    <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
                    <p className="mt-2 text-sm text-slate-400">Sign in to continue to your dashboard.</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
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

                <div className="mt-5 text-center">
                    <Link to="/" className="text-sm text-slate-400 hover:text-emerald-400">
                        Back to portal
                    </Link>
                </div>
            </section>
        </main>
    );
}