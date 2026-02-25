"use client";

import { useState, useEffect } from "react";
import {
    QrCode, Search, ShieldCheck, ShieldAlert,
    Activity, Clock, CheckCircle2, XCircle,
    Loader2, Fingerprint, Lock, Zap,
    Database, Scan, ArrowRight, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { verifierService } from "@/lib/verifier-service";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifierDashboard() {
    const [idInput, setIdInput] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanReady, setScanReady] = useState(false);
    const [result, setResult] = useState<{ status: 'valid' | 'invalid' | 'none', details?: any } | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        // Fetch verification history
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        // Mock history for now
        setHistory([
            { id: "V-9921", type: "Identity Proof", status: "success", time: "2 mins ago" },
            { id: "V-9920", type: "Vaccine Record", status: "success", time: "15 mins ago" },
            { id: "V-9919", type: "Identity Proof", status: "failed", time: "1 hour ago" },
        ]);
    };

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!idInput) return;

        setIsVerifying(true);
        setResult(null);

        try {
            // First try real verification from Registry
            const res = await verifierService.verifyProofID(idInput);

            if (res.verified) {
                setResult({
                    status: 'valid',
                    details: {
                        subject: "Verified Holder",
                        attributes: res.details?.attributes.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)) || [],
                        proofType: res.details?.proofType || "ZKP-Presentation"
                    }
                });
                setHistory(prev => [{ id: idInput.substring(0, 8).toUpperCase(), type: res.details?.credType || "Dynamic Proof", status: "success", time: "Just now" }, ...prev]);
            } else {
                // Check if it's the specific mock "INVALID" trigger
                if (idInput.toUpperCase().includes("INVALID")) {
                    setResult({ status: 'invalid', details: { reason: "ZKP Mathematical mismatch" } });
                } else {
                    setResult({ status: 'invalid', details: { reason: res.reason || "Proof ID not recognized by Registry" } });
                }
            }
        } catch (err) {
            setResult({ status: 'invalid', details: { reason: "System Node Error" } });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                        <div className="w-3 h-12 bg-purple-600 rounded-full" />
                        Verifier <span className="text-purple-500">Node</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Trustless Verification Interface • Root Shard 01
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Node Active</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left: Input / Scan */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden p-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                                    <Scan className="text-purple-500" />
                                    Identity Input
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">
                                    Scan a Holder's QR code or enter their Unique DID to initiate the zero-knowledge verification process.
                                </p>

                                <form onSubmit={handleVerify} className="space-y-4">
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <Input
                                            value={idInput}
                                            onChange={e => setIdInput(e.target.value)}
                                            placeholder="Enter Unique DID or Hash..."
                                            className="h-16 pl-12 bg-black/40 border-white/10 text-white rounded-2xl focus:ring-purple-500"
                                        />
                                    </div>
                                    <Button
                                        disabled={isVerifying || !idInput}
                                        className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-purple-500/20"
                                    >
                                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Verification"}
                                    </Button>
                                </form>

                                <div className="pt-6 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setScanReady(!scanReady)}
                                        className="w-full h-16 rounded-2xl border border-dashed border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest"
                                    >
                                        <QrCode className="w-5 h-5 mr-3" />
                                        Launch Mobile Scanner
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center p-8 relative overflow-hidden min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {isVerifying ? (
                                        <motion.div
                                            key="verifying"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-center space-y-6 z-10"
                                        >
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto" />
                                                <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 w-8 h-8" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-white font-black uppercase text-xs tracking-widest">Computing Proof</p>
                                                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-tighter italic">Validating BBS+ Signature...</p>
                                            </div>
                                        </motion.div>
                                    ) : result ? (
                                        <motion.div
                                            key="result"
                                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                            className="text-center space-y-8 z-10"
                                        >
                                            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${result.status === 'valid' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
                                                } border-[6px] shadow-2xl`}>
                                                {result.status === 'valid' ? (
                                                    <ShieldCheck className="w-16 h-16 text-emerald-500" />
                                                ) : (
                                                    <ShieldAlert className="w-16 h-16 text-rose-500" />
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className={`text-4xl font-black uppercase tracking-tighter italic ${result.status === 'valid' ? 'text-emerald-500' : 'text-rose-500'
                                                    }`}>
                                                    {result.status === 'valid' ? 'Verified' : 'Invalid'}
                                                </h4>
                                                {result.status === 'valid' ? (
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        {result.details.attributes.map((attr: string, i: number) => (
                                                            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest">{attr}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase">{result.details.reason}</p>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                onClick={() => { setResult(null); setIdInput(""); }}
                                                className="text-[10px] font-black uppercase text-slate-500 hover:text-white tracking-widest"
                                            >
                                                Next Check <ArrowRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-center space-y-4"
                                        >
                                            <Activity className="w-12 h-12 text-slate-700 mx-auto" />
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Input</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Background Decorative items */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent -z-10" />
                            </div>
                        </div>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: "Today's Checks", val: "142", icon: Zap, color: "text-purple-500" },
                            { label: "Success Rate", val: "99.4%", icon: Activity, color: "text-emerald-500" },
                            { label: "Avg Latency", val: "42ms", icon: Clock, color: "text-blue-500" }
                        ].map((s, i) => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                                    <h4 className="text-3xl font-black text-white">{s.val}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: History */}
                <div className="space-y-8">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                                <History className="text-purple-500 w-5 h-5" />
                                Live Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px]">
                            <div className="px-8 space-y-4 pb-8">
                                {history.map((h, i) => (
                                    <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {h.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-white uppercase tracking-tight">{h.type}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">{h.id} • {h.time}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
