"use client";

import { useState } from "react";
import {
    Search, QrCode, ShieldCheck, ShieldX, Scan,
    Zap, Clock, History, CheckCircle2, XCircle,
    Loader2, ArrowRight, Activity, Filter, RefreshCcw, Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";

export interface VerificationLog {
    id?: string;
    checkedId: string;
    result: "Verified" | "Not Verified";
    type: string;
    timestamp: string;
    verifier: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

function VerifierPortalContent() {
    const { backendProfile } = useAuth();
    const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
    const addVerificationLog = (log: any) => {
        setVerificationLogs(prev => [log, ...prev]);
    };
    const { toast } = useToast();

    const [inputId, setInputId] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<VerificationLog | null>(null);
    const [verifyingMode, setVerifyingMode] = useState<"id" | "qr">("id");

    // Approval Check
    if (backendProfile?.role === "verifier" && !backendProfile?.approved) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-6 bg-noise">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem]">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Clock className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Awaiting Approval</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Your organization account for <span className="text-white font-semibold">{backendProfile.name}</span> is currently pending administrative review.
                        </p>
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
                            Access will be granted once an administrator approves your request.
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputId.trim() && verifyingMode === "id") return;

        setIsChecking(true);
        setResult(null);

        try {
            const res = await fetch("/api/privaseal/verifier/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    privaseal_id: inputId,
                    qr_data: verifyingMode === "qr" ? inputId : null
                })
            });

            const data = await res.json();
            const isVerified = data.found && data.valid;

            const newLog: VerificationLog = {
                id: `LOG-${Date.now()}`,
                checkedId: inputId || "QR-SCAN",
                result: (isVerified ? "Verified" : "Not Verified") as VerificationLog["result"],
                type: data.credential_type || "Universal Check",
                verifier: backendProfile?.name || "Local Verifier",
                timestamp: new Date().toISOString()
            };

            setVerificationLogs(prev => [newLog, ...prev]);
            setResult(newLog);

            toast({
                title: isVerified ? "Verification Successful" : "Verification Failed",
                description: isVerified ? (data.message || "Cryptographic proof is valid.") : (data.message || "Invalid proof or expired credential."),
                variant: isVerified ? "default" : "destructive"
            });
        } catch (err) {
            console.error("Verification error:", err);
            toast({
                title: "Error",
                description: "Failed to communicate with the verification server.",
                variant: "destructive"
            });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                            <Search className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-3xl tracking-tight">Verifier Portal</h1>
                            <p className="text-slate-400 text-sm">Real-time Zero-Knowledge proof validation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-white/10">
                        <Button
                            variant={verifyingMode === "id" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setVerifyingMode("id")}
                            className="bg-transparent hover:bg-white/5 text-slate-400 h-8 font-bold text-[10px] uppercase"
                        >
                            ID Search
                        </Button>
                        <Button
                            variant={verifyingMode === "qr" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setVerifyingMode("qr")}
                            className="bg-transparent hover:bg-white/5 text-slate-400 h-8 font-bold text-[10px] uppercase"
                        >
                            QR Scan
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* 3A: Verification Input */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900/50 border-white/10 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                                <Activity className="w-32 h-32 text-white" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Start Verification
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Query the PrivaSeal registry for a specific ID or scan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {verifyingMode === "id" ? (
                                    <form onSubmit={handleVerify} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Holder PrivaSeal ID</label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    placeholder="e.g. PS-XXXX-XXXX"
                                                    value={inputId}
                                                    onChange={e => setInputId(e.target.value)}
                                                    className="pl-10 bg-slate-950/50 border-white/10 text-white h-12 text-lg font-mono focus:border-emerald-500/50"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isChecking}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            {isChecking ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Decrypting Proof...</> : "Verify Credential"}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="space-y-6 text-center py-8">
                                        <div className="w-24 h-24 bg-slate-950 rounded-3xl border border-white/10 flex items-center justify-center mx-auto relative group flex-col gap-2 cursor-pointer hover:border-emerald-500/30 transition-all">
                                            <Scan className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white font-bold">Waiting for Scan...</p>
                                            <p className="text-slate-500 text-xs px-12">Point camera at the holder's PrivaSeal Wallet QR code</p>
                                        </div>
                                        <Button onClick={() => handleVerify()} className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                                            Simulate Scan Result
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3B: Verification Result Card */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-3xl border p-8 flex items-center justify-between overflow-hidden relative ${result.result === "Verified"
                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/5 border-red-500/20 text-red-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${result.result === "Verified" ? "bg-emerald-600/20" : "bg-red-600/20"
                                            }`}>
                                            {result.result === "Verified"
                                                ? <CheckCircle2 className="w-10 h-10" />
                                                : <XCircle className="w-10 h-10" />
                                            }
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1 opacity-60">Status Result</div>
                                            <h3 className="text-3xl font-black tracking-tight mb-2">
                                                {result.result.toUpperCase()}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                <ShieldX className="w-3.5 h-3.5" /> Zero personal data revealed.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Checked At</p>
                                        <p className="text-white font-mono text-sm">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-current opacity-[0.03] pointer-events-none" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Principle Placeholder */}
                        {!result && !isChecking && (
                            <div className="bg-slate-900/30 border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                                <Info className="w-8 h-8 text-slate-700" />
                                <p className="text-slate-500 text-sm max-w-[240px]">Search for a PrivaSeal ID or scan a QR to view verification results.</p>
                            </div>
                        )}
                        {isChecking && (
                            <div className="bg-slate-900/30 border border-white/10 rounded-3xl p-16 text-center animate-pulse flex flex-col items-center justify-center gap-4">
                                <RefreshCcw className="w-8 h-8 text-emerald-600 animate-spin" />
                                <p className="text-slate-400 font-medium">Validating BBS+ Proof...</p>
                            </div>
                        )}
                    </div>

                    {/* 3C: Verification History Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-400" /> Recent History
                            </h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white px-2 h-8">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {verificationLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white font-mono text-xs">{log.checkedId}</p>
                                                <p className="text-[10px] text-slate-500">{log.type}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`
                                                    ${log.result === "Verified"
                                                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                                        : "text-red-400 border-red-500/20 bg-red-500/5"}
                                                `}>
                                                    {log.result}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-slate-500 text-[10px] font-medium">
                                                    <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function VerifierPortal() {
    return (
        <RoleGuard allowedRoles={["verifier"]}>
            <VerifierPortalContent />
        </RoleGuard>
    );
}
