import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { account } from "../lib/appwrite";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const userId = searchParams.get("userId");
                const secret = searchParams.get("secret");

                if (!userId || !secret) {
                    throw new Error(
                        "Missing OAuth credentials in callback URL. Did the provider redirect correctly?"
                    );
                }

                try {
                    await account.createSession({ userId, secret });
                } catch (err) {
                    // Session may already be active from a prior successful OAuth round-trip.
                    // In that case just proceed and let account.get() verify who we are.
                    const msg = err?.message || "";
                    const alreadyActive =
                        /session is active|already/i.test(msg) || err?.code === 401;
                    if (!alreadyActive) throw err;
                }

                const user = await account.get();
                if (cancelled) return;

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: user.$id,
                        email: user.email,
                        name: user.name,
                        provider: "google",
                    })
                );

                const role = sessionStorage.getItem("pendingRole");
                sessionStorage.removeItem("pendingRole");

                if (role === "manager") navigate("/manager", { replace: true });
                else if (role === "cashier") navigate("/cashier", { replace: true });
                else navigate("/", { replace: true });
            } catch (e) {
                if (cancelled) return;
                setError(e?.message || "Could not complete sign-in.");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [navigate, searchParams]);

    return (
        <main className="min-h-screen bg-slate-950 px-4 flex items-center justify-center text-slate-100">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-lg">
                {error ? (
                    <>
                        <h1 className="text-xl font-semibold text-red-400">Sign-in failed</h1>
                        <p className="mt-2 text-sm text-slate-400">{error}</p>
                        <button
                            onClick={() => navigate("/login", { replace: true })}
                            className="mt-5 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400"
                        >
                            Back to login
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-xl font-semibold">Signing you in…</h1>
                        <p className="mt-2 text-sm text-slate-400">One moment.</p>
                    </>
                )}
            </div>
        </main>
    );
}
