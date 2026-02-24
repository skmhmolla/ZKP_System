"use client";

import { useState, useMemo } from "react";
import {
    Wallet, QrCode, ShieldCheck, BadgeCheck,
    Smartphone, Scan, Zap, Clock, Info,
    ArrowRight, CreditCard, Lock, Eye, Download,
    Loader2, Fingerprint, Share2, History,
    EyeOff, RefreshCcw, Unlock, Settings,
    User, Shield, Activity, Database,
    CheckCircle2, AlertTriangle, Binary,
    Network, X, Trash2, ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";

export interface Credential {
    id: string;
    type: string;
    status: "Active" | "Revoked" | "Pending";
    issuer: string;
    date: string;
    attributes: Record<string, string | number>;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function WalletPortalContent() {
    const { backendProfile } = useAuth();
    const credentials: Credential[] = [];
    const { toast } = useToast();

    // UI States
    const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
    const [isProving, setIsProving] = useState(false);
    const [proofStep, setProofStep] = useState<"prepare" | "generate" | "ready">("prepare");
    const [disclosureOptions, setDisclosureOptions] = useState<Record<string, boolean>>({
        "Age": true,
        "Nationality": false,
        "Full Name": false
    });
    const [proofEntropy, setProofEntropy] = useState("");
    const [proofProgress, setProofProgress] = useState(0);

    // Filter credentials to exclude revoked for the main view, but keep one revoked for demo
    const activeCreds = credentials.filter(c => c.status !== "Revoked");
    const revokedCreds = credentials.filter(c => c.status === "Revoked");

    const startProving = (cred: Credential) => {
        setSelectedCred(cred);
        setProofStep("prepare");
        setIsProving(true);
    };

    const runMathSimulation = async () => {
        setProofStep("generate");
        setProofProgress(0);

        const phases = [
            "Fetching randomized blinding factors...",
            "Constructing Schnorr commitments...",
            "Computing non-interactive Fiat-Shamir challenge...",
            "Finalizing Zero-Knowledge signature..."
        ];

        for (let i = 0; i < phases.length; i++) {
            setProofProgress((i + 1) * 25);
            await new Promise(r => setTimeout(r, 600));
        }

        setProofEntropy("zkp_" + Math.random().toString(16).slice(2, 32));
        setProofStep("ready");
    };

    const regenerateProof = () => {
        const newEntropy = "zkp_" + Math.random().toString(16).slice(2, 32);
        setProofEntropy(newEntropy);
        toast({
            title: "New Unlinkable Proof Derived",
            description: "Proof hash updated. Identity remains anonymous.",
        });
    };

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-10">

                {/* --- TOP BAR --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-3xl tracking-tight leading-none mb-2">PrivaSeal Wallet</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-black px-3">
                                    <Database className="w-3 h-3 mr-1.5" /> Local Encrypted Storage
                                </Badge>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    <Shield className="w-3 h-3" /> Secure Enclave Active
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="bg-slate-900 border-white/10 text-slate-400 gap-2 h-12 rounded-2xl hover:text-white transition-all">
                            <History className="w-4 h-4" /> Activity
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest">
                            Backup Wallet
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* --- LEFT COLUMN: ID & STATS --- */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Identity Card */}
                        <Card className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 border-none shadow-2xl shadow-blue-900/40 relative overflow-hidden group rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Fingerprint className="w-40 h-40 text-black rotate-12" />
                            </div>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                            <CardHeader className="relative pb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                        <BadgeCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Status</p>
                                        <Badge className="bg-white/20 text-white border-none text-[10px] uppercase font-black">Authorized</Badge>
                                    </div>
                                </div>
                                <CardTitle className="text-white text-3xl font-black tracking-tight leading-none mb-1">
                                    {backendProfile?.name || "Dev_Holder_01"}
                                </CardTitle>
                                <p className="text-white/60 text-xs font-bold font-mono tracking-tighter">ID: PS-AX71-B291-K00XV</p>
                            </CardHeader>
                            <CardContent className="relative space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Privacy Score</p>
                                        <span className="text-white font-black text-xl italic">98%</span>
                                    </div>
                                    <Progress value={98} className="h-2 bg-black/20" indicatorClassName="bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                </div>

                                <div className="bg-white p-5 rounded-[2rem] w-fit mx-auto shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <QrCode className="w-32 h-32 text-slate-900" />
                                </div>
                            </CardContent>
                            <CardFooter className="relative bg-black/10 flex justify-center py-5 border-t border-white/5">
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Secure Proof Generation Active
                                </span>
                            </CardFooter>
                        </Card>

                        {/* Privacy Stats Dashboard */}
                        <Card className="bg-slate-900/60 border-white/5 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader>
                                <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-400" /> Privacy Dashboard
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Proofs Shared", val: "42", icon: Share2, color: "text-blue-400" },
                                        { label: "Data Saved", val: "312KB", icon: Shield, color: "text-emerald-400" },
                                        { label: "Trackers Blocked", val: "∞", icon: EyeOff, color: "text-rose-400" },
                                        { label: "Key Rotations", val: "5", icon: RefreshCcw, color: "text-amber-400" },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                            <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                                            <p className="text-xl font-black text-white">{stat.val}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex gap-3 items-start">
                                    <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                        Your identity usage is untraceable. Issuers cannot see when or where you present these proofs.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN: WALLET & VAULT --- */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Credential Vault Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end px-2">
                                <div>
                                    <h3 className="text-white font-black text-2xl tracking-tight">Credential Vault</h3>
                                    <p className="text-slate-500 text-xs font-medium italic">Attribute-based ZK-Credentials stored on-device.</p>
                                </div>
                                <Badge variant="outline" className="h-9 px-4 rounded-xl border-white/10 text-slate-400 bg-slate-900 font-bold uppercase text-[10px]">
                                    {activeCreds.length} Active
                                </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {activeCreds.map((cred, idx) => (
                                    <motion.div
                                        key={cred.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-slate-900 border border-white/5 hover:border-blue-500/20 rounded-[2.5rem] p-8 transition-all hover:bg-slate-800/40 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                                            <Binary className="w-32 h-32 text-blue-400" />
                                        </div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                                                <BadgeCheck className="w-7 h-7" />
                                            </div>
                                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-[10px] font-black px-3">
                                                Verified Anchor
                                            </Badge>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-white font-black text-2xl tracking-tighter italic">{cred.type} Certificate</h4>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Provider: {cred.issuer}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Status Level</span>
                                                    <span className="text-blue-400 font-black text-[10px] uppercase">Secure Node P2</span>
                                                </div>
                                                <Button
                                                    onClick={() => startProving(cred)}
                                                    className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black text-[10px] uppercase h-10 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/10 tracking-widest"
                                                >
                                                    Present Proof
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Revoked Credential Demo */}
                                {revokedCreds.map((cred) => (
                                    <div key={cred.id} className="bg-slate-900 opacity-60 grayscale border border-rose-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-rose-500/5" />
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                                                <AlertTriangle className="w-7 h-7" />
                                            </div>
                                            <Badge variant="outline" className="text-rose-500 border-rose-500/20 bg-rose-500/5 text-[10px] font-black px-3">
                                                Revoked
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-slate-400 font-black text-2xl tracking-tighter italic">{cred.type}</h4>
                                            <p className="text-rose-500/60 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                                                This credential was invalidated by the issuer and can no longer generate valid proofs.
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <button className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-600 hover:text-blue-400 hover:border-blue-500/20 transition-all hover:bg-blue-500/5 group">
                                    <div className="w-16 h-16 rounded-[1.5rem] border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] block mb-1">Import External ID</span>
                                        <span className="text-[9px] font-medium opacity-60">JSON-LD, DID, or NFC-Pass</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Verification History (Zero Tracking Demo) */}
                        <Card className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-white/5 px-8 py-6">
                                <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                                    <History className="w-4 h-4 text-slate-400" /> Recent Verifications
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-[10px] font-medium italic">History stored only on this device. Verifiability status is local.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                            <th className="px-8 py-5">Timestamp</th>
                                            <th className="px-8 py-5">Verifier Entity</th>
                                            <th className="px-8 py-5">Proof Target</th>
                                            <th className="px-8 py-5 text-right">Privacy Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { time: "2m ago", verifier: "Global Airways", target: "Age >= 18", status: "Untraceable" },
                                            { time: "1h ago", verifier: "Metropolitan Hospital", target: "Immunity Status", status: "Selective" },
                                            { time: "Yesterday", verifier: "SecureFinance App", target: "Membership ID", status: "Unlinkable" },
                                        ].map((log, i) => (
                                            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-5 text-xs font-medium text-slate-500">{log.time}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-white font-bold text-[11px] uppercase tracking-tight">
                                                        <Network className="w-3.5 h-3.5 text-blue-500" /> {log.verifier}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Badge className="bg-slate-950 border-white/10 text-[9px] font-black uppercase tracking-widest py-0 px-2">{log.target}</Badge>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase italic flex items-center justify-end gap-1.5">
                                                        <ShieldCheck className="w-3.5 h-3.5" /> {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* --- PROOF GENERATION MODAL (OVERLAY) --- */}
            <AnimatePresence>
                {isProving && selectedCred && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-noise">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProving(false)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl shadow-blue-500/10 overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsProving(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Modal Header */}
                            <div className="p-10 pb-6 border-b border-white/5">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-white text-3xl font-black tracking-tight leading-none uppercase italic">Construct ZK-Proof</h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">From: {selectedCred.type} Certificate</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

                                {proofStep === "prepare" && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Unlock className="w-4 h-4 text-blue-400" /> Selective Disclosure Configuration
                                                </h4>
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase">User Controlled</Badge>
                                            </div>

                                            <div className="space-y-3">
                                                {Object.entries(disclosureOptions).map(([key, val]) => (
                                                    <div key={key} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn("p-2 rounded-lg", val ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500")}>
                                                                {val ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold text-sm tracking-tight">{key}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{val ? "Revealing Attribute" : "Generating Range Proof"}</p>
                                                            </div>
                                                        </div>
                                                        <Switch checked={val} onCheckedChange={(c) => setDisclosureOptions({ ...disclosureOptions, [key]: c })} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex gap-4">
                                            <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-white font-black text-xs uppercase tracking-widest">Privacy Assurance</p>
                                                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                                    Selecting "Range Proof" means the verifier ONLY sees <span className="text-blue-400">TRUE/FALSE</span>.
                                                    They will not know your exact value.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {proofStep === "generate" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] animate-pulse" />
                                            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                                                <Binary className="w-12 h-12 text-white animate-bounce" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 w-full px-10">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Computing ZK-Proof...</h3>
                                            <Progress value={proofProgress} className="h-2 bg-slate-950" indicatorClassName="bg-blue-600" />
                                            <p className="text-[10px] font-mono text-blue-400/60 uppercase tracking-widest animate-pulse h-4">
                                                {proofProgress < 25 && "Randomizing Entropy Seed..."}
                                                {proofProgress >= 25 && proofProgress < 50 && "Establishing Schnorr Protocols..."}
                                                {proofProgress >= 50 && proofProgress < 75 && "Formulating Non-Disclosure Commitment..."}
                                                {proofProgress >= 75 && "Sealing Cryptographic Packet..."}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {proofStep === "ready" && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_60px_rgba(255,255,255,0.1)] group">
                                                <QrCode className="w-48 h-48 text-slate-900" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-emerald-400 text-2xl font-black uppercase tracking-tight italic">Proof Ready for Presentation</h3>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Session-Scoped & Ephemeral</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Unlinkable Proof Hash</span>
                                                    <code className="text-[11px] font-mono text-blue-400/80 break-all">{proofEntropy}</code>
                                                </div>
                                                <Button onClick={regenerateProof} variant="ghost" size="icon" className="text-slate-500 hover:text-blue-400">
                                                    <RefreshCcw className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 justify-center">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Signed BBS+</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 justify-center">
                                                    <Unlock className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Selective Reveal</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </div>

                            {/* Modal Footer */}
                            <div className="p-10 bg-white/5 border-t border-white/5 flex gap-4">
                                <Button
                                    onClick={() => setIsProving(false)}
                                    variant="ghost"
                                    className="h-14 px-8 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Cancel
                                </Button>

                                {proofStep === "prepare" ? (
                                    <Button
                                        onClick={runMathSimulation}
                                        className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-500/20"
                                    >
                                        Construct Proof <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : proofStep === "ready" ? (
                                    <Button
                                        onClick={() => {
                                            toast({ title: "Proof Broadcasted", description: "Verification completed successfully." });
                                            setIsProving(false);
                                        }}
                                        className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/20"
                                    >
                                        Submit Presentation <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        className="flex-1 h-14 rounded-2xl bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-[0.2em]"
                                    >
                                        Processing Math...
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function WalletPortal() {
    return (
        <RoleGuard allowedRoles={["holder"]}>
            <WalletPortalContent />
        </RoleGuard>
    );
}
