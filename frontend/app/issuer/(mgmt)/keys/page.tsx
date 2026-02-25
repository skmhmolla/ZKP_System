"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Key, ShieldCheck, Lock, Activity,
    RefreshCcw, Download, Copy, Eye,
    EyeOff, ShieldAlert, Cpu, Terminal
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function KeyManagementPage() {
    const { toast } = useToast();
    const [showKeys, setShowKeys] = useState(false);

    // Mock Keys as requested (real crypto integration later)
    const keys = {
        masterSecret: "882f-x92a-b1c0-449e-k992-p01s-autoroot",
        publicKey: "did:privaseal:issuer:0x882f...b1c0",
        revocationKey: "rev_882fb1c0_k992_active",
        status: "SECURED",
        algorithm: "BBS+ (BLS12-381)",
        lastRotated: "2026-02-15"
    };

    const handleRotate = () => {
        toast({
            title: "Encryption Engine",
            description: "Generating new entropy and rotating root keys...",
        });

        setTimeout(() => {
            toast({
                title: "Keys Rotated",
                description: "Global public key broadcasted successfully.",
            });
        }, 2000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Key copied to clipboard",
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Key <span className="text-blue-500">Management</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Cryptographic root of trust and authority node keys
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Master Keys Section */}
                <Card className="lg:col-span-8 bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-blue-500/[0.02]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-2xl font-black uppercase italic">Root Authority Keys</CardTitle>
                                    <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Cryptographic Vault</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowKeys(!showKeys)}
                                className="border-white/10 text-slate-400 hover:text-white rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest"
                            >
                                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showKeys ? "Hide Sensitive" : "Reveal Keys"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Key Rows */}
                        <div className="space-y-6">
                            {[
                                { label: "Master Secret Key", val: keys.masterSecret, status: "SECURED", icon: Lock, color: "text-rose-500", sensitive: true },
                                { label: "Public Verifying Key", val: keys.publicKey, status: "BROADCASTED", icon: Activity, color: "text-blue-500", sensitive: false },
                                { label: "Revocation Registry Key", val: keys.revocationKey, status: "ENCRYPTED", icon: ShieldAlert, color: "text-amber-500", sensitive: true },
                            ].map((k, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <k.icon className={`w-4 h-4 ${k.color}`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest">{k.status}</Badge>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-sm text-white/80 overflow-hidden truncate">
                                            {k.sensitive && !showKeys ? "••••••••••••••••••••••••••••••••" : k.val}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(k.val)}
                                            className="h-12 w-12 hover:bg-white/5 border border-white/5 rounded-2xl"
                                        >
                                            <Copy className="w-4 h-4 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <Button
                                onClick={handleRotate}
                                className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex flex-col items-center justify-center gap-1"
                            >
                                <RefreshCcw className="w-4 h-4 text-amber-500" />
                                Rotate Root Keys
                            </Button>
                            <Button className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex flex-col items-center justify-center gap-1">
                                <Download className="w-4 h-4 text-blue-500" />
                                Backup Master Vault
                            </Button>
                            <Button className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex flex-col items-center justify-center gap-1">
                                <Copy className="w-4 h-4 text-emerald-500" />
                                Export Public Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Crypto Engine Info */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-sm tracking-widest">Crypto Engine</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase italic">BBS+ Implemented</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "Security Level", val: "256-bit AES" },
                                { label: "Curve Type", val: "BLS12-381" },
                                { label: "Signature Size", val: "48 Bytes" },
                                { label: "Verification", val: "< 2ms" },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    <span className="text-xs font-mono font-bold text-blue-400">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-amber-500/5 border-amber-500/10 backdrop-blur-2xl rounded-[2.5rem] p-8">
                        <div className="flex gap-4">
                            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
                            <div className="space-y-2">
                                <h3 className="text-amber-500 font-black uppercase text-xs tracking-widest">Authority Notice</h3>
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                                    Rotating master keys will invalidate all previously issued credentials that are not tied to a multi-sig anchor. Use with extreme caution.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
