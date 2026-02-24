"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { loginWithGoogle, logoutUser } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/config/admin";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { currentUser, backendProfile, authStatus, refreshProfile } = useAuth();

    // STEP 3: BLOCK LOGIN PAGE IF ALREADY LOGGED IN
    useEffect(() => {
        if (authStatus === "authenticated" && backendProfile?.role === "admin") {
            router.replace("/issuer");
        }
    }, [authStatus, backendProfile, router]);

    const handleAdminLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const { user, error: authError } = await loginWithGoogle("admin");

            if (authError) {
                setError(authError);
                setLoading(false);
                return;
            }

            if (user?.email && ADMIN_EMAILS.includes(user.email)) {
                await refreshProfile();
                router.replace("/issuer");
            } else {
                await logoutUser();
                setError("You are not authorized as Issuer Admin");
                setLoading(false);
            }
        } catch (err) {
            setError("An unexpected error occurred during login.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-[420px] w-full z-10"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20"
                        >
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic indent-1">Authority</h1>
                        <p className="text-slate-400 font-medium text-sm tracking-wide">Secure Node Authentication</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-wider"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleAdminLogin}
                            disabled={loading}
                            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-blue-600/20 group uppercase text-xs tracking-[0.2em]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Verify Entity Identity
                                </>
                            )}
                        </button>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 opacity-60">
                                Restricted Access — Root Node Only
                            </p>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/")}
                                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold text-xs"
                            >
                                Cancel & Exit
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
