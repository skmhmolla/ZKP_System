"use client";

import { useState } from "react";
import {
    Key, ShieldCheck, RefreshCcw, Download, Copy,
    Lock, ShieldAlert, History, Terminal, CheckCircle2, Loader2,
    AlertCircle, Fingerprint, Cpu, Hash, Globe,
    Database, Activity, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function KeyManagementPage() {
    const addAuditLog = (action: string, actor: string, service: string, detail: string) => {
        console.log(`Audit Log: ${action} - ${actor} - ${service} - ${detail}`);
    };
    const { toast } = useToast();
    const [isRotating, setIsRotating] = useState(false);
    const [rotationProgress, setRotationProgress] = useState(0);

    const [keys, setKeys] = useState({
        publicKey: "04:6F:E1:92:AA:73:C9:82:11:0B:44:A2:3F:82:91:02:AA:73:C9:82:11",
        fingerprint: "SHA256:PS8821-X992-AK12-P991",
        lastRotation: new Date(Date.now() - 86400000 * 30).toISOString(),
        version: "v4.2.1"
    });

    const rotateKeys = async () => {
        setIsRotating(true);
        setRotationProgress(0);

        // Simulation Phases
        const phases = [
            "Generating new BLS12-381 Root...",
            "Encrypting shards with AES-256-GCM...",
            "Broadcasting public anchor to network...",
            "Updating HSM secure enclave..."
        ];

        for (let i = 0; i < phases.length; i++) {
            setRotationProgress((i + 1) * 25);
            await new Promise(r => setTimeout(r, 800));
        }

        const newFingerprint = `SHA256:PS${Math.floor(1000 + Math.random() * 8999)}-Y${Math.floor(1000 + Math.random() * 8999)}`;
        setKeys({
            ...keys,
            fingerprint: newFingerprint,
            lastRotation: new Date().toISOString()
        });

        addAuditLog("KEY_ROTATION", "Admin_Root", "Crypto_Service", `New Fingerprint: ${newFingerprint}`);

        toast({
            title: "Keys Rotated Successfully",
            description: "Active BBS+ signing keys have been updated across the network.",
        });
        setIsRotating(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to Clipboard", description: "The key material has been copied." });
    };

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Key Management</h1>
                    <p className="text-slate-400 font-medium italic">Manage cryptographic root keys for BBS+ signatures.</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-xl h-fit w-fit font-black uppercase text-[10px] tracking-widest shadow-[0_0_15px_#10b98115]">
                    <ShieldCheck className="w-3 h-3 mr-2" /> HSM Hardware Secured
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Key Status */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-white/10 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Key className="w-32 h-32 text-blue-400" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-400" /> Active Master Signing Key
                        </CardTitle>
                        <CardDescription className="text-slate-500">Currently active keys for sealing identity proofs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Hash className="w-3 h-3" /> Public Key (Base64)
                                    </label>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(keys.publicKey)} className="h-6 text-[10px] text-blue-400 font-bold hover:bg-blue-400/10 uppercase italic">
                                        <Copy className="w-3 h-3 mr-1" /> Copy
                                    </Button>
                                </div>
                                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-slate-400 leading-relaxed tracking-wider group-hover:border-blue-500/20 transition-all">
                                    {keys.publicKey}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint className="w-3 h-3" /> Fingerprint
                                </label>
                                <div className="flex items-center justify-between p-4 bg-slate-950 border border-white/5 rounded-2xl">
                                    <code className="text-blue-400 font-bold text-xs tracking-tight">{keys.fingerprint}</code>
                                    <Badge className="bg-blue-600 border-none text-[9px] uppercase font-black px-3">ACTIVE</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Rotation Cycle</p>
                                <p className="text-white font-bold text-xs">{new Date(keys.lastRotation).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Scheme</p>
                                <p className="text-white font-bold text-xs uppercase tracking-tighter">BBS+ (BLS12-381)</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Version</p>
                                <p className="text-white font-bold text-xs">{keys.version}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Actions */}
                <div className="space-y-6">
                    <Card className="bg-rose-500/5 border-rose-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldAlert className="w-24 h-24 text-rose-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest leading-none">Rotation Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AnimatePresence mode="wait">
                                {isRotating ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-center text-[10px] font-black text-rose-400 uppercase">
                                            <span>Rotating Cryptographic Root...</span>
                                            <span>{rotationProgress}%</span>
                                        </div>
                                        <Progress value={rotationProgress} className="h-1.5 bg-slate-900" indicatorClassName="bg-rose-600 animate-pulse" />
                                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                                            <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Updating global consensus nodes...</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        <Button
                                            onClick={rotateKeys}
                                            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black h-12 rounded-xl transition-all shadow-lg shadow-white/5 uppercase text-xs tracking-widest"
                                        >
                                            <RefreshCcw className="w-4 h-4 mr-2" /> Rotate Keys
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-white/10 text-slate-400 font-black h-12 rounded-xl hover:bg-white/5 uppercase text-xs tracking-widest"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Backup Root
                                        </Button>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-[10px] text-slate-500 italic flex gap-3 leading-relaxed">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                "Key rotation will invalidate transient proofs but does NOT reveal identity anchors."
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/60 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] leading-none">Network Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "HSM Node Connection", status: "Nominal", icon: Cpu, color: "text-emerald-400" },
                                { label: "Consensus Agreement", status: "Active (12/12)", icon: Globe, color: "text-blue-400" },
                                { label: "Registry Sync", status: "Synchronized", icon: Database, color: "text-purple-400" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${item.color} uppercase`}>{item.status}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Key History Table */}
            <Card className="bg-slate-900/40 border border-white/5 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-500" /> Cryptographic Lifecycle History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <tr>
                                    <th className="px-8 py-5">Event ID</th>
                                    <th className="px-8 py-5">Timestamp</th>
                                    <th className="px-8 py-5">Action Type</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { id: "ROT-00821", date: "Feb 01, 2026", action: "Scheduled Rotation", status: "SUCCESS", detail: "Root Entropy Refresh" },
                                    { id: "ROT-00712", date: "Jan 01, 2026", action: "Emergency Rotation", status: "SUCCESS", detail: "Policy Upgrade 4.0" },
                                    { id: "ROT-00629", date: "Dec 15, 2025", action: "System Init", status: "SUCCESS", detail: "Genesis Key Block" },
                                ].map((row, i) => (
                                    <tr key={i} className="text-xs text-slate-400 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 font-mono font-bold text-blue-400">{row.id}</td>
                                        <td className="px-8 py-5 font-medium">{row.date}</td>
                                        <td className="px-8 py-5 font-bold text-white uppercase tracking-tighter">{row.action}</td>
                                        <td className="px-8 py-5">
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black">{row.status}</Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-600 italic">{row.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
