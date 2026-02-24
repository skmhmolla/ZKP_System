"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Mail, Lock, Phone, ArrowRight, Github, Chrome, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginWithGoogle, signUpWithEmail, loginWithEmail, loginWithPhoneOTP, confirmPhoneOTP } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAILS } from "@/config/admin";
import { logoutUser } from "@/lib/auth";

export default function HolderLoginPage() {
    const [mode, setMode] = useState<"login" | "signup" | "phone">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshProfile } = useAuth();
    const router = useRouter();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = mode === "signup"
                ? await signUpWithEmail(email, password, "holder")
                : await loginWithEmail(email, password);

            if (result.user?.email && ADMIN_EMAILS.includes(result.user.email)) {
                await logoutUser();
                setError("Admin accounts cannot login as Holder");
            } else if (result.error) {
                setError(result.error);
            } else {
                await refreshProfile();
                router.replace("/wallet");
            }
        } catch (err) {
            setError("Authentication failed");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { user, error } = await loginWithGoogle("holder");
            if (user?.email && ADMIN_EMAILS.includes(user.email)) {
                await logoutUser();
                setError("Admin accounts cannot login as Holder");
            } else if (error) {
                setError(error);
            } else {
                await refreshProfile();
                router.replace("/wallet");
            }
        } catch (err) {
            setError("Google login failed");
        }
        setLoading(false);
    };

    const handlePhoneAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!showOtp) {
                const { error } = await loginWithPhoneOTP(phoneNumber);
                if (error) setError(error);
                else setShowOtp(true);
            } else {
                const { user, error } = await confirmPhoneOTP(otp, "holder");
                if (user?.email && ADMIN_EMAILS.includes(user.email)) {
                    await logoutUser();
                    setError("Admin accounts cannot login as Holder");
                } else if (error) {
                    setError(error);
                } else {
                    await refreshProfile();
                    router.replace("/wallet");
                }
            }
        } catch (err) {
            setError("Phone authentication failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6 bg-noise relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="fixed bottom-0 -right-20 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full z-10"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Wallet" : "Phone Login"}
                        </h1>
                        <p className="text-gray-400">
                            {mode === "login" ? "Access your digital identity" : "Start your privacy journey today"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {mode === "phone" ? (
                        <form onSubmit={handlePhoneAuth} className="space-y-4">
                            {!showOtp ? (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="+1234567890"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Verification Code"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & Continue"}
                                    </button>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => { setMode("login"); setShowOtp(false); }}
                                className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors"
                            >
                                Back to Email Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050B18] px-2 text-gray-500">Or continue with</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 p-3 rounded-xl text-white transition-all"
                                >
                                    <Chrome className="w-5 h-5 text-red-500" />
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("phone")}
                                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 p-3 rounded-xl text-white transition-all"
                                >
                                    <Phone className="w-5 h-5 text-emerald-500" />
                                    Phone
                                </button>
                            </div>

                            <div className="text-center mt-8">
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    {mode === "login" ? (
                                        <>Don't have an account? <span className="text-blue-400 font-semibold">Sign Up</span></>
                                    ) : (
                                        <>Already have an account? <span className="text-blue-400 font-semibold">Sign In</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <div id="recaptcha-container"></div>
            </motion.div>
        </div>
    );
}
