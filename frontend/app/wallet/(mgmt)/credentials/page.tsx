"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { holderService } from "@/lib/holder-service";
import {
    Fingerprint, BadgeCheck, ShieldCheck,
    ArrowUpRight, Info, Eye, Download,
    ShieldAlert, Globe, Clock, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";

export default function CredentialsPage() {
    const { backendProfile } = useAuth();
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const unsubscribe = holderService.subscribeToCredentials(backendProfile.firebase_uid, (creds) => {
            setCredentials(creds);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [backendProfile]);

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        My <span className="text-emerald-500">Credentials</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Your cryptographically signed identity certificates
                    </p>
                </div>

                <Link href="/wallet/request">
                    <Button className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-500/20">
                        Enroll New ID
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Secure Enclave...</p>
                    </div>
                ) : credentials.length === 0 ? (
                    <div className="col-span-full py-40 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 mx-auto">
                            <Fingerprint className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-black text-xl uppercase italic">No Credentials Found</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enroll your identity to populate your wallet.</p>
                        </div>
                        <Link href="/wallet/request">
                            <Button variant="outline" className="border-white/10 text-emerald-400 hover:bg-emerald-500/5 h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                                Start Enrollment
                            </Button>
                        </Link>
                    </div>
                ) : (
                    credentials.map((cred, idx) => (
                        <motion.div
                            key={cred.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="bg-slate-900 border-white/5 hover:border-emerald-500/20 rounded-[2.5rem] p-8 transition-all hover:bg-slate-800/40 group relative overflow-hidden h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck className="w-32 h-32 text-emerald-500" />
                                </div>

                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                        <BadgeCheck className="w-9 h-9" />
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase px-3">Active Anchor</Badge>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h4 className="text-white text-2xl font-black tracking-tighter italic uppercase leading-none">{cred.credentialType}</h4>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> PrivaSeal Authority
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Issue Date</p>
                                            <p className="text-white font-bold text-xs uppercase">{new Date(cred.issuedAt?.toDate()).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-emerald-400 font-bold text-xs uppercase tracking-tighter flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Encrypted
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5">
                                                <QrCode className="w-5 h-5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2.5rem] max-w-sm flex flex-col items-center p-10">
                                            <DialogHeader className="items-center text-center">
                                                <DialogTitle className="text-2xl font-black uppercase italic text-emerald-500">Credential QR</DialogTitle>
                                                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                                                    Share for instant verification
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="mt-8 p-6 bg-white rounded-[2rem] shadow-2xl shadow-emerald-500/10">
                                                <QRCodeCanvas
                                                    value={`privaseal:credential:${cred.id}`}
                                                    size={220}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <p className="mt-8 text-[10px] text-slate-500 font-mono font-bold tracking-tighter truncate w-full text-center px-4">
                                                ID: {cred.id}
                                            </p>
                                        </DialogContent>
                                    </Dialog>

                                    <div className="w-[1px] h-8 bg-white/5 my-auto" />

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="flex-1 h-12 rounded-xl text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest">
                                                Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2.5rem] max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black uppercase italic italic text-emerald-500">Credential Attributes</DialogTitle>
                                                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                                    Raw signed attributes stored in your secure element.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                {Object.entries(cred.attributes || {}).map(([key, val]: [any, any]) => (
                                                    <div key={key} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                                                        <p className="text-white font-mono text-sm break-all font-bold tracking-tight">{String(val)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-4">
                                                <Info className="w-6 h-6 text-emerald-500 shrink-0" />
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                                    These attributes are never transmitted. They are used locally as inputs for Zero-Knowledge circuits.
                                                </p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Link href="/wallet/proof" className="flex-1">
                                        <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest group">
                                            Prove <ArrowUpRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-widest">Self-Custody</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed italic">
                        Your private keys never leave your device. PrivaSeal is a non-custodial identity protocol.
                    </p>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-widest">Unlinkable</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed italic">
                        Credentials use BBS+ signatures allowing for selective disclosure without creating a digital footprint.
                    </p>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-widest">Live Sync</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed italic">
                        Registry status is checked in real-time to ensure your credentials are valid and not revoked.
                    </p>
                </Card>
            </div>
        </div>
    );
}
