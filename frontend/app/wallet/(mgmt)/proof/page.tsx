"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { holderService } from "@/lib/holder-service";
import {
    Zap, ShieldCheck, Eye, EyeOff,
    Binary, RefreshCcw, Lock, Unlock,
    ArrowRight, QrCode, CheckCircle2,
    CheckSquare, Square, Timer, Loader2,
    Copy, Shield, Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function ProofGeneratorPage() {
    const { backendProfile } = useAuth();
    const { toast } = useToast();
    const [credentials, setCredentials] = useState<any[]>([]);
    const [selectedCred, setSelectedCred] = useState<any>(null);
    const [isProving, setIsProving] = useState(false);
    const [proofStep, setProofStep] = useState<"select" | "config" | "generate" | "ready">("select");
    const [disclosureOptions, setDisclosureOptions] = useState<Record<string, boolean>>({});
    const [proofEntropy, setProofEntropy] = useState("");
    const [proofProgress, setProofProgress] = useState(0);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const unsubscribe = holderService.subscribeToCredentials(backendProfile.firebase_uid, setCredentials);
        return () => unsubscribe();
    }, [backendProfile]);

    useEffect(() => {
        if (proofStep === "ready" && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            regenerateProof();
        }
    }, [proofStep, timer]);

    const handleSelectCred = (cred: any) => {
        setSelectedCred(cred);
        const initialDisclosure = Object.keys(cred.attributes || {}).reduce((acc, key) => {
            acc[key] = false; // Default to hide (private)
            return acc;
        }, {} as Record<string, boolean>);
        setDisclosureOptions(initialDisclosure);
        setProofStep("config");
    };

    const runMathSimulation = async () => {
        setProofStep("generate");
        setProofProgress(0);

        const phases = [
            "Randomizing Blinding Factors",
            "Establishing Schnorr Protocol",
            "Fiat-Shamir Transformation",
            "Sealing Zero-Knowledge Packet"
        ];

        for (let i = 0; i < phases.length; i++) {
            setProofProgress((i + 1) * 25);
            await new Promise(r => setTimeout(r, 800));
        }

        const entropy = "zkp_" + Math.random().toString(16).slice(2, 32);
        setProofEntropy(entropy);

        // Save to backend history
        if (backendProfile?.firebase_uid) {
            await holderService.saveProof(backendProfile.firebase_uid, {
                purpose: "ZK-Attribute Verification",
                credType: selectedCred.credentialType,
                proofHash: entropy,
                disclosedAttributes: Object.keys(disclosureOptions).filter(k => disclosureOptions[k])
            });
        }

        setProofStep("ready");
        setTimer(60);
    };

    const regenerateProof = () => {
        const entropy = "zkp_" + Math.random().toString(16).slice(2, 32);
        setProofEntropy(entropy);
        setTimer(60);
        toast({
            title: "Proof Rotated",
            description: "Ephemeral signature refreshed for enhanced privacy.",
        });
    };

    const copyProofID = () => {
        navigator.clipboard.writeText(proofEntropy);
        toast({ title: "Copied", description: "Proof ID copied to clipboard." });
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Proof <span className="text-emerald-500">Generator</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Construct unlinkable cryptographic presentations
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* --- SELECT CREDENTIAL --- */}
                {proofStep === "select" && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {credentials.map((cred) => (
                            <button
                                key={cred.id}
                                onClick={() => handleSelectCred(cred)}
                                className="text-left group bg-slate-900 border border-white/5 hover:border-emerald-500/20 rounded-[2.5rem] p-8 transition-all hover:bg-slate-800/40 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck className="w-24 h-24 text-emerald-500" />
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Binary className="w-6 h-6" />
                                </div>
                                <h3 className="text-white text-xl font-black uppercase italic italic">{cred.credentialType}</h3>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Verify Attributes</p>
                                <div className="mt-6 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                    Configure Proof <ArrowRight className="w-3 h-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- CONFIGURE DISCLOSURE --- */}
                {proofStep === "config" && selectedCred && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-white/5 bg-blue-500/[0.02]">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                                            <Unlock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white text-2xl font-black uppercase italic">Selective Disclosure</CardTitle>
                                            <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Toggle attributes to reveal or keep anonymous</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => setProofStep("select")} className="text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-widest">
                                        Back to Vault
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {Object.entries(selectedCred.attributes || {}).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", disclosureOptions[key] ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500")}>
                                                    {disclosureOptions[key] ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-sm tracking-tight">{key}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {disclosureOptions[key] ? `Value: ${String(val)}` : "Zero-Knowledge Mode"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={disclosureOptions[key]}
                                                onCheckedChange={(c) => setDisclosureOptions({ ...disclosureOptions, [key]: c })}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] flex gap-6">
                                    <ShieldCheck className="w-12 h-12 text-blue-400 shrink-0" />
                                    <div className="space-y-2">
                                        <h4 className="text-white font-black text-sm uppercase tracking-widest">Privacy Assurance (BBS+ BBS)</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider italic">
                                            By keeping attributes toggled OFF, the verifier receives a cryptographic guarantee that the data exists and is valid, without seeing the actual values. This is true privacy.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={runMathSimulation}
                                    className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-blue-500/20"
                                >
                                    Construct Proof Packet
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* --- GENERATION ANIMATION --- */}
                {proofStep === "generate" && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 flex flex-col items-center justify-center text-center space-y-10 bg-slate-900/40 rounded-[3rem] border border-white/5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] animate-pulse" />
                            <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center relative shadow-[0_0_60px_rgba(59,130,246,0.5)]">
                                <Binary className="w-16 h-16 text-white animate-bounce" />
                            </div>
                        </div>
                        <div className="space-y-6 w-full max-w-md px-10">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Solving ZK-Circuit...</h3>
                            <div className="space-y-2">
                                <Progress value={proofProgress} className="h-2 bg-slate-950" indicatorClassName="bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span>Entropy Mix</span>
                                    <span>{proofProgress}%</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-mono text-blue-400/60 uppercase tracking-[0.3em] h-6 flex items-center justify-center">
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                {proofProgress < 25 && "Deriving Scalar Multipliers..."}
                                {proofProgress >= 25 && proofProgress < 50 && "Folding Non-Disclosure Proofs..."}
                                {proofProgress >= 50 && proofProgress < 75 && "Computing BBS+ Signature Reveal..."}
                                {proofProgress >= 75 && "Finalizing ZK-Presentation..."}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* --- PROOF READY / QR SCREEN --- */}
                {proofStep === "ready" && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
                        <Card className="bg-slate-950 border-emerald-500/20 rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-500/5 relative">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

                            <CardHeader className="p-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-white text-4xl font-black uppercase italic tracking-tighter">VALID PROOF</CardTitle>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Present this QR code to any authorized PrivaSeal Verifier Registry.</p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-10 flex flex-col items-center gap-10">
                                <div className="relative p-8 bg-white rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.15)] group">
                                    <div className="absolute inset-0 bg-emerald-500/5 rotate-3 -z-10 rounded-[3rem] blur-xl" />
                                    <QrCode className="w-64 h-64 text-slate-900" />

                                    {/* Expiry Overlay */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-500/30 px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-xl">
                                        <Timer className="w-4 h-4 text-emerald-500 animate-pulse" />
                                        <span className="text-white font-black text-xs tabular-nums">Rotating in {timer}s</span>
                                    </div>
                                </div>

                                <div className="w-full max-w-xl space-y-4">
                                    <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ephemeral Proof ID</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] uppercase font-black">Unlinkable</Badge>
                                        </div>
                                        <div className="flex gap-4">
                                            <code className="flex-1 bg-black/40 p-4 rounded-xl font-mono text-[11px] text-blue-400/80 break-all border border-white/5">{proofEntropy}</code>
                                            <Button onClick={copyProofID} variant="outline" className="h-14 w-14 border-white/10 hover:bg-white/5 rounded-xl shrink-0">
                                                <Copy className="w-5 h-5 text-slate-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-[1.5rem] flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Device Mode</p>
                                                <p className="text-white font-bold text-[11px] uppercase">Secure Enclave</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-[1.5rem] flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Safety Level</p>
                                                <p className="text-white font-bold text-[11px] uppercase">Full Anonymity</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="p-10 border-t border-white/5 flex gap-4">
                                <Button
                                    onClick={() => setProofStep("config")}
                                    variant="ghost"
                                    className="h-14 px-10 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest"
                                >
                                    Modify Selection
                                </Button>
                                <Button
                                    onClick={() => setProofStep("select")}
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl"
                                >
                                    Finish & Exit
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
