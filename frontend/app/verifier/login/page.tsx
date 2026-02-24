"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { signUpWithEmail, loginWithEmail } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAILS } from "@/config/admin";
import { logoutUser } from "@/lib/auth";

export default function VerifierLoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [orgName, setOrgName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { refreshProfile } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === "signup") {
                const result = await signUpWithEmail(email, password, "verifier", orgName, { orgName });
                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccess(true);
                }
            } else {
                const result = await loginWithEmail(email, password);
                if (result.user?.email && ADMIN_EMAILS.includes(result.user.email)) {
                    await logoutUser();
                    setError("Admin accounts cannot login as Verifier");
                } else if (result.error) {
                    setError(result.error);
                } else {
                    await refreshProfile();
                    router.replace("/verifier");
                }
            }
        } catch (err) {
            setError("Authentication failed");
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6 bg-noise">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem]">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Registration Received</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Your organization registration for <span className="text-white font-semibold">{orgName}</span> has been submitted.
                            An administrator will review your request and approve access shortly.
                        </p>
                        <button onClick={() => setSuccess(false)} className="text-blue-400 hover:underline">Back to Login</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6 bg-noise">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                            <Building2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Verifier Portal</h1>
                        <p className="text-gray-400">Enterprise Verification Services</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "signup" && (
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Organization Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="email"
                                placeholder="Organization Email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (mode === "login" ? "Sign In" : "Register Organization")}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <button
                            type="button"
                            onClick={() => setMode(mode === "login" ? "signup" : "login")}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {mode === "login" ? (
                                <>Need to register your organization? <span className="text-emerald-400 font-semibold">Sign Up</span></>
                            ) : (
                                <>Already have an account? <span className="text-emerald-400 font-semibold">Sign In</span></>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
