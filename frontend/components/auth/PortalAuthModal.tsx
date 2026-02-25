"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    X, Shield, ShieldCheck, Building2, Mail, Lock, User, Calendar, MapPin,
    Smartphone, LogIn, UserPlus, AlertCircle, ArrowRight, Loader2,
    CheckCircle2, Chrome, Briefcase, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmail, loginWithEmail, loginWithGoogle, UserRole } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { ADMIN_EMAILS } from "@/config/admin";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "issuer" | "wallet" | "verifier";
    initialTab?: "login" | "register";
    inline?: boolean;
}

type SubmitState = "idle" | "loading" | "success" | "error";

// ── Portal config ─────────────────────────────────────────────────────────────
const PORTAL_CONFIG = {
    issuer: {
        label: "Issuer Authority Portal",
        icon: ShieldCheck,
        gradient: "from-blue-600 to-indigo-600",
        accent: "blue",
        accentClass: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
        iconBg: "bg-blue-600/20 text-blue-400",
        role: "issuer_admin" as UserRole,
        dashboard: "/issuer/dashboard",
        googleRole: "issuer_admin" as UserRole,
    },
    wallet: {
        label: "Holder Wallet",
        icon: Shield,
        gradient: "from-emerald-500 to-teal-500",
        accent: "emerald",
        accentClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
        iconBg: "bg-emerald-500/20 text-emerald-400",
        role: "holder_user" as UserRole,
        dashboard: "/wallet/dashboard",
        googleRole: "holder_user" as UserRole,
    },
    verifier: {
        label: "Verifier Access",
        icon: Building2,
        gradient: "from-purple-600 to-pink-600",
        accent: "purple",
        accentClass: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",
        iconBg: "bg-purple-600/20 text-purple-400",
        role: "verifier" as UserRole,
        dashboard: "/verifier/dashboard",
        googleRole: "verifier" as UserRole,
    },
};

// ── Component ─────────────────────────────────────────────────────────────────
export const PortalAuthModal = ({ isOpen, onClose, mode, initialTab = "login", inline = false }: AuthModalProps) => {
    const config = PORTAL_CONFIG[mode];
    const PortalIcon = config.icon;

    const [tab, setTab] = useState<"login" | "register">(mode === "issuer" ? "login" : initialTab);
    const [submitState, setSubmitState] = useState<SubmitState>("idle");
    const [error, setError] = useState<string | null>(null);
    const { refreshProfile, logout } = useAuth();
    const router = useRouter();

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [idType, setIdType] = useState("National ID");
    // Verifier-specific
    const [orgName, setOrgName] = useState("");
    const [businessType, setBusinessType] = useState("Corporation");

    // Reset form when modal opens/changes mode
    useEffect(() => {
        if (isOpen) {
            setTab(mode === "issuer" ? "login" : initialTab);
            setError(null);
            setSubmitState("idle");
            setEmail("");
            setPassword("");
            setFullName("");
        }
    }, [isOpen, mode, initialTab]);

    const handleNavigateToDashboard = async (dashboard: string) => {
        if (mode === "wallet") {
            localStorage.setItem("walletAuth", "true");
        }
        await refreshProfile();
        setTimeout(() => {
            router.push(dashboard);
            onClose();
        }, 800); // Show success state briefly before redirect
    };

    // ── Email / Password Auth ─────────────────────────────────────────────────
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitState("loading");
        setError(null);

        try {
            if (tab === "login") {
                const { user, error: authError } = await loginWithEmail(email, password);

                if (authError) {
                    setError(authError);
                    setSubmitState("error");
                    return;
                }

                if (user) {
                    // Issuer: strict admin email check
                    if (mode === "issuer") {
                        if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
                            await logout();
                            setError("Unauthorized Authority Access — this portal is restricted to approved administrators only.");
                            setSubmitState("error");
                            return;
                        }
                    }
                    setSubmitState("success");
                    await handleNavigateToDashboard(config.dashboard);
                }

            } else {
                // Registration
                const extraData: Record<string, unknown> = {};

                if (mode === "wallet") {
                    extraData.full_name = fullName;
                    extraData.dob = dob;
                    extraData.mobile = mobile;
                    extraData.address = address;
                    extraData.id_type = idType;
                }

                if (mode === "verifier") {
                    extraData.org_name = orgName;
                    extraData.business_type = businessType;
                }

                const { user, error: authError } = await signUpWithEmail(
                    email, password, config.role, fullName || orgName, extraData
                );

                if (authError) {
                    setError(authError);
                    setSubmitState("error");
                    return;
                }

                if (user) {
                    // Auto-create verification request for wallet holders
                    if (mode === "wallet") {
                        try {
                            await api.holder.requestVerification(user.uid, [`${idType} Scan`, "Proof of Residence"]);
                        } catch {
                            // Non-fatal — credential request can be made later
                        }
                    }
                    setSubmitState("success");
                    await handleNavigateToDashboard(config.dashboard);
                }
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setSubmitState("error");
        } finally {
            if (submitState !== "success") setSubmitState("idle");
        }
    };

    // ── Google Auth ────────────────────────────────────────────────────────────
    const handleGoogleAuth = async () => {
        setSubmitState("loading");
        setError(null);

        try {
            const { user, error: authError } = await loginWithGoogle(config.googleRole);

            if (authError) {
                setError(authError);
                setSubmitState("error");
                return;
            }

            if (user) {
                // Issuer portal: admin email whitelist
                if (mode === "issuer") {
                    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
                        await logout();
                        setError("Unauthorized Authority Access — only approved admin accounts can access this portal.");
                        setSubmitState("error");
                        return;
                    }
                }
                setSubmitState("success");
                await handleNavigateToDashboard(config.dashboard);
            }
        } catch {
            setError("Google sign-in failed. Please try again.");
            setSubmitState("error");
        }
    };

    if (!isOpen) return null;

    const isLoading = submitState === "loading";
    const isSuccess = submitState === "success";

    return (
        <AnimatePresence>
            <div className={cn(
                "z-[100] flex items-center justify-center",
                inline ? "w-full h-full relative" : "fixed inset-0 p-4"
            )}>
                {/* Backdrop */}
                {!inline && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
                    />
                )}

                {/* Modal */}
                <motion.div
                    initial={inline ? { opacity: 1 } : { scale: 0.92, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={inline ? { opacity: 1 } : { scale: 0.92, opacity: 0, y: 24 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className={cn(
                        "relative w-full overflow-hidden",
                        inline ? "" : "max-w-[480px] bg-[#0c111d] border border-white/10 rounded-[2rem] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8)]"
                    )}
                >
                    {/* Top accent stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

                    {/* Close button */}
                    {!isLoading && !isSuccess && (
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="p-8 md:p-10">
                        {/* Success State */}
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-8 text-center space-y-6"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </motion.div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                                            Access Granted
                                        </h3>
                                        <p className="text-slate-400 text-sm font-medium">
                                            Redirecting to your dashboard...
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                                </motion.div>
                            ) : (
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${config.iconBg}`}>
                                            <PortalIcon className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-1">
                                            {config.label}
                                        </h2>
                                        <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
                                            {mode === "issuer"
                                                ? "Restricted Authority Access"
                                                : tab === "login" ? "Sign in to continue" : "Create your account"}
                                        </p>
                                    </div>

                                    {/* Tab switcher (not for issuer) */}
                                    {mode !== "issuer" && (
                                        <div className="flex bg-black/40 p-1 rounded-xl mb-7 border border-white/5">
                                            {(["login", "register"] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => { setTab(t); setError(null); }}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === t
                                                        ? "bg-white/10 text-white shadow-lg"
                                                        : "text-slate-500 hover:text-slate-300"
                                                        }`}
                                                >
                                                    {t === "login" ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <LogIn className="w-3.5 h-3.5" /> Login
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <UserPlus className="w-3.5 h-3.5" /> Register
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-xs font-medium leading-relaxed"
                                            >
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Google Sign-In */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleAuth}
                                        disabled={isLoading}
                                        className="w-full h-12 mb-5 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                                Continue with Google
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex-1 h-px bg-white/5" />
                                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>

                                    {/* Email/Password Form */}
                                    <form onSubmit={handleEmailAuth} className="space-y-4">
                                        {/* Registration extra fields */}
                                        <AnimatePresence>
                                            {tab === "register" && mode === "wallet" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-4 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FieldGroup label="Full Name" icon={User}>
                                                            <Input required value={fullName} onChange={e => setFullName(e.target.value)}
                                                                placeholder="John Doe" className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                                        </FieldGroup>
                                                        <FieldGroup label="Date of Birth" icon={Calendar}>
                                                            <Input required type="date" value={dob} onChange={e => setDob(e.target.value)}
                                                                className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                                        </FieldGroup>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FieldGroup label="Mobile" icon={Smartphone}>
                                                            <Input required value={mobile} onChange={e => setMobile(e.target.value)}
                                                                placeholder="+91 XXXXX XXXXX" className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                                        </FieldGroup>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Document</label>
                                                            <select value={idType} onChange={e => setIdType(e.target.value)}
                                                                className="w-full h-11 bg-black/40 border border-white/5 text-white text-sm rounded-lg px-3 focus:ring-2 focus:ring-emerald-500/50 outline-none">
                                                                <option>National ID</option>
                                                                <option>Passport</option>
                                                                <option>Drivers License</option>
                                                                <option>Aadhaar Card</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <FieldGroup label="Current Address" icon={MapPin}>
                                                        <Input required value={address} onChange={e => setAddress(e.target.value)}
                                                            placeholder="Street, City, Country" className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                                    </FieldGroup>
                                                </motion.div>
                                            )}

                                            {tab === "register" && mode === "verifier" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-4 overflow-hidden"
                                                >
                                                    <FieldGroup label="Organization Name" icon={Building2}>
                                                        <Input required value={orgName} onChange={e => setOrgName(e.target.value)}
                                                            placeholder="Acme Corp Ltd." className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                                    </FieldGroup>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Type</label>
                                                        <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                                                            className="w-full h-11 bg-black/40 border border-white/5 text-white text-sm rounded-lg px-3 focus:ring-2 focus:ring-purple-500/50 outline-none">
                                                            <option>Corporation</option>
                                                            <option>Government Agency</option>
                                                            <option>NGO / Non-Profit</option>
                                                            <option>Financial Institution</option>
                                                            <option>Healthcare Provider</option>
                                                            <option>Educational Institution</option>
                                                        </select>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Email */}
                                        <FieldGroup label="Email Address" icon={Mail}>
                                            <Input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                                                placeholder="user@example.com" className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                        </FieldGroup>

                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                                {tab === "login" && (
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer hover:text-white transition-colors">
                                                        Forgot?
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                                <Input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••" minLength={6}
                                                    className="pl-10 bg-black/40 border-white/5 text-white h-11 text-sm" />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full h-12 mt-2 rounded-xl font-black uppercase text-xs tracking-[0.15em] shadow-xl transition-all ${config.accentClass} disabled:opacity-50`}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    {tab === "login" ? "Sign In" : "Create Account"}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Issuer restriction notice */}
                                    {mode === "issuer" && (
                                        <p className="mt-6 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.35em]">
                                            🔒 Restricted Root Authority Access Only
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// ── Sub-component: labelled input wrapper ──────────────────────────────────────
function FieldGroup({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                {children}
            </div>
        </div>
    );
}
