"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { PortalAuthModal } from "@/components/auth/PortalAuthModal";
import {
    Wallet, ShieldCheck, Fingerprint, Lock,
    Zap, ArrowRight, CheckCircle2, QrCode,
    Smartphone, Database, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletLandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");
    const { authStatus, backendProfile } = useAuth();
    const router = useRouter();

    // Removed auto-redirect to follow user requirement: Navbar click MUST always show this page.

    const openAuth = (tab: "login" | "register") => {
        setAuthTab(tab);
        setIsAuthOpen(true);
    };

    return (
        <div className="premium-dark min-h-screen bg-[#020617]">
            <Navbar />

            <main className="pt-32 pb-20 container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left: Content */}
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 text-emerald-500 font-black uppercase text-[10px] tracking-[0.4em] italic mb-6">
                                <span className="w-12 h-px bg-emerald-500/50" />
                                Personal Identity Vault
                            </div>
                            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                                Your Private <br />
                                <span className="text-emerald-500">Identity Wallet</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                                Securely upload identity documents, request verification from the authority,
                                receive ZK-signed credentials, and generate QR proofs for instant verification
                                without revealing your raw data.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: Fingerprint, title: "Biometric Auth", desc: "Hardware-level security" },
                                { icon: Shield, title: "Zero Knowledge", desc: "Prove without revealing" },
                                { icon: QrCode, title: "Instant Scan", desc: "One-tap verification" },
                                { icon: Database, title: "Local Storage", desc: "No cloud data honeypots" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/30 transition-all group"
                                >
                                    <item.icon className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-white font-black text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-4 items-center">
                            <Button
                                onClick={() => openAuth("register")}
                                className="h-16 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 group"
                            >
                                Register
                                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => openAuth("login")}
                                className="h-16 px-10 bg-transparent border-white/10 hover:bg-white/5 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em]"
                            >
                                Login
                            </Button>
                        </div>
                    </div>

                    {/* Right: Wallet Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-emerald-600/10 blur-[120px] rounded-full -z-10" />

                        {/* Fake Smartphone / Card UI */}
                        <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-2 shadow-2xl overflow-hidden relative group max-w-sm mx-auto aspect-[9/18]">
                            <div className="bg-[#050B18] h-full w-full rounded-[2.5rem] p-6 space-y-8">
                                {/* Status Bar */}
                                <div className="flex justify-between items-center opacity-50">
                                    <span className="text-[10px] font-bold">9:41</span>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-2 bg-white rounded-sm" />
                                        <div className="w-4 h-2 bg-white rounded-sm" />
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-black italic uppercase">Wallet</h4>
                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                        <Smartphone className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>

                                {/* Identity Card Mock */}
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <ShieldCheck className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-white/20 rounded-full" />
                                        <div className="space-y-1">
                                            <div className="w-20 h-2 bg-white/40 rounded-full" />
                                            <div className="w-12 h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Global DID</div>
                                        <div className="text-[10px] font-mono text-white truncate">did:privaseal:0x882...91f</div>
                                    </div>
                                </div>

                                {/* Activity */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Activity</h5>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                                            <div className="w-8 h-8 bg-black/40 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="w-24 h-2 bg-slate-700 rounded-full" />
                                                <div className="w-16 h-1 bg-slate-800 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <PortalAuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                mode="wallet"
                initialTab={authTab}
            />
        </div>
    );
}
