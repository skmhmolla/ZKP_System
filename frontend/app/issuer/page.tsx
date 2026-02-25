"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { PortalAuthModal } from "@/components/auth/PortalAuthModal";
import {
    ShieldCheck, Building2, Key, Lock, Activity,
    ArrowRight, CheckCircle2, ShieldAlert, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function IssuerLandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { authStatus, backendProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authStatus === "loading") return; // Wait for auth to resolve
        if (authStatus === "authenticated" && (backendProfile?.role === "issuer_admin" || backendProfile?.role === "admin")) {
            router.replace("/issuer/dashboard");
        }
    }, [authStatus, backendProfile, router]);

    return (
        <div className="premium-dark min-h-screen bg-[#050B18]">
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
                            <div className="flex items-center gap-3 text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] italic mb-6">
                                <span className="w-12 h-px bg-blue-500/50" />
                                PrivaSeal Authority Node
                            </div>
                            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                                Root <br />
                                <span className="text-blue-600">Authority</span> Portal
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                                The central cryptographic hub for issuing BBS+ ZK-Credentials.
                                Securely verify identities, manage root keys, and authorize ecosystem participants.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: ShieldCheck, title: "Identity Issuance", desc: "ZKP-ready BBS+ signatures" },
                                { icon: Key, title: "Root Key Mgmt", desc: "Secure hardware-level keys" },
                                { icon: Building2, title: "Org Verification", desc: "Third-party auditing" },
                                { icon: Activity, title: "Ecosystem Stats", desc: "Real-time node health" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-blue-500/30 transition-all group"
                                >
                                    <item.icon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-white font-black text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-4 items-center">
                            <Button
                                onClick={() => setIsAuthOpen(true)}
                                className="h-16 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/20 group"
                            >
                                Login as Authority
                                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <div className="flex items-center gap-3 px-6 h-16 bg-white/5 rounded-2xl border border-white/10 italic font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Internal Node ID: PS-IX-772
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Node Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full -z-10" />
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <Lock className="w-64 h-64 text-white" />
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Cryptography Engine</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase italic">Status: Operational</p>
                                </div>
                                <Cpu className="text-blue-500 w-8 h-8" />
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: "BBS+ Signature Scheme", val: "99.9% Efficiency", icon: CheckCircle2, color: "text-emerald-500" },
                                    { label: "Selective Disclosure", val: "Active", icon: CheckCircle2, color: "text-emerald-500" },
                                    { label: "Root Revocation List", val: "Synced", icon: CheckCircle2, color: "text-emerald-500" },
                                    { label: "Ecosystem Access", val: "Restricted", icon: ShieldAlert, color: "text-blue-500" }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <row.icon className={`w-4 h-4 ${row.color}`} />
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight">{row.label}</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${row.color}`}>{row.val}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                                <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed text-center">
                                    "Only authorized accounts with issuer-level clearance can interact with this shard. Unauthorized attempts are logged and blacklisted immediately."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <PortalAuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                mode="issuer"
            />
        </div>
    );
}
