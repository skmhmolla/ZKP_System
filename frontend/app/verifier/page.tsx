"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { PortalAuthModal } from "@/components/auth/PortalAuthModal";
import {
    Search, QrCode, ShieldCheck, Building2,
    Lock, ArrowRight, CheckCircle2, Scan,
    Activity, Globe, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifierLandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");
    const { authStatus, backendProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authStatus === "loading") return;
        if (authStatus === "authenticated" && backendProfile?.role === "verifier") {
            router.replace("/verifier/dashboard");
        }
    }, [authStatus, backendProfile, router]);

    const openAuth = (tab: "login" | "register") => {
        setAuthTab(tab);
        setIsAuthOpen(true);
    };

    return (
        <div className="premium-dark min-h-screen bg-[#050505]">
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
                            <div className="flex items-center gap-3 text-purple-500 font-black uppercase text-[10px] tracking-[0.4em] italic mb-6">
                                <span className="w-12 h-px bg-purple-500/50" />
                                Organization Verification Node
                            </div>
                            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                                Verifier <br />
                                <span className="text-purple-600">Access</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                                Enable trust-less verification for your organization.
                                Instantly validate user credentials without accessing or storing their private data.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: Scan, title: "QR Validation", desc: "Instant mobile scanning" },
                                { icon: Landmark, title: "Compliance", desc: "Regulatory grade audits" },
                                { icon: Globe, title: "Universal", desc: "Works across all shards" },
                                { icon: Activity, title: "Logs", desc: "Tamper-proof history" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-purple-500/30 transition-all group"
                                >
                                    <item.icon className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-white font-black text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-4 items-center">
                            <Button
                                onClick={() => openAuth("register")}
                                className="h-16 px-10 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-purple-500/20 group"
                            >
                                Organization Register
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

                    {/* Right: Visual Scanning Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-purple-600/10 blur-[120px] rounded-full -z-10" />
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">

                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <QrCode className="text-purple-500 w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Scanner Interface</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase italic">Node ID: VRF-NODE-01</p>
                                </div>
                            </div>

                            {/* Verification Animation Mock */}
                            <div className="relative aspect-square bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center mb-6 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ScannerAnimation />
                                </div>
                                <div className="z-10 text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 scale-125">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-emerald-500 font-black uppercase italic tracking-widest">Verified</p>
                                        <p className="text-slate-500 text-[10px] font-bold">Proof Type: BBS+ Signature</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Disclosure Policy</span>
                                    <span className="text-purple-500">Strict Minimal</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-white/80 font-bold">Age Over 18</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-[10px] text-white/40 font-bold line-through">Passport Number</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <PortalAuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                mode="verifier"
                initialTab={authTab}
            />
        </div>
    );
}

const ScannerAnimation = () => {
    return (
        <div className="relative w-full h-full">
            <motion.div
                animate={{
                    top: ["0%", "100%", "0%"]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-1 bg-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        </div>
    )
}
