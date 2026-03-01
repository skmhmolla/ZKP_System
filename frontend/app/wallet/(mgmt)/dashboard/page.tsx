"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
    Wallet, Fingerprint, ShieldCheck,
    Smartphone, BadgeCheck, QrCode, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function WalletDashboard() {
    const { backendProfile } = useAuth();
    const [dashboardData, setDashboardData] = useState<{ request: any, credential: any } | null>(null);
    const [loading, setLoading] = useState(true);

    const handleDownloadQR = () => {
        const svg = document.getElementById("credential-qr");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `PrivaSeal-QR-${dashboardData?.credential?.credentialId || 'ID'}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const fetchDashboard = async () => {
            try {
                const res = await api.holder.getDashboardInfo(backendProfile.firebase_uid);
                setDashboardData(res.data);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [backendProfile]);

    if (loading) return <div>Loading Wallet...</div>;

    const request = dashboardData?.request;
    const credential = dashboardData?.credential;

    return (
        <div className="space-y-10">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Wallet <span className="text-emerald-500">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Your decentralized identity control center
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] uppercase font-black">Authorized Node</Badge>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-12 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border-none shadow-2xl relative overflow-hidden group rounded-[2.5rem]">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <ShieldCheck className="w-80 h-80 text-black rotate-12" />
                    </div>
                    <div className="relative p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-6 flex-1">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                        <Smartphone className="w-6 h-6 text-white" />
                                    </div>
                                    <Badge className={cn(
                                        "border-none text-[9px] uppercase font-black px-4 py-1.5 h-auto",
                                        credential ? "bg-emerald-400 text-emerald-900" :
                                            request?.status === "pending" ? "bg-amber-400 text-amber-900" :
                                                request?.status === "rejected" ? "bg-rose-400 text-white" : "bg-white/20 text-white"
                                    )}>
                                        {credential ? "Identity Verified" : (request?.status || "Unverified Unit")}
                                    </Badge>
                                </div>
                                <h2 className="text-white text-4xl font-black tracking-tighter leading-none mb-2">
                                    {request ? request.name : "Holder Root"}
                                </h2>
                                <p className="text-white/60 text-xs font-bold font-mono tracking-tighter uppercase">
                                    DID: did:privaseal:{backendProfile?.firebase_uid?.substring(0, 16)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {!request && (
                                <Link href="/wallet/request">
                                    <Button className="h-14 px-10 bg-white text-emerald-900 hover:bg-emerald-50 disabled:bg-white/20 disabled:text-white/40 font-black uppercase text-xs tracking-widest rounded-2xl">
                                        Request Identity
                                    </Button>
                                </Link>
                            )}
                            {request?.status === 'pending' && (
                                <Button disabled className="h-14 px-10 bg-amber-500 text-amber-950 font-black uppercase text-xs tracking-widest rounded-2xl">
                                    Review in Progress
                                </Button>
                            )}
                            {request?.status === 'rejected' && (
                                <Link href="/wallet/request">
                                    <Button className="h-14 px-10 bg-rose-500 text-rose-50 hover:bg-rose-600 font-black uppercase text-xs tracking-widest rounded-2xl">
                                        Re-apply (Rejected)
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Credential Data Section */}
            {credential ? (
                <div className="max-w-md">
                    <Card className="bg-slate-900 border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all rounded-[2rem] shadow-2xl">
                        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <BadgeCheck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className="bg-emerald-500 text-white border-none text-[8px] uppercase font-black px-2.5">Verified Badge</Badge>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{credential.credentialId}</span>
                                </div>
                            </div>
                            <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight mt-4">Identity Passport</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 flex flex-col items-center">
                            <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-slate-900 mt-4">
                                <QRCodeSVG id="credential-qr" value={credential.qrData} size={300} level="L" includeMargin={true} />
                            </div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">Scan for Verification</p>
                            <Button onClick={handleDownloadQR} variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-emerald-400 uppercase text-[10px] tracking-widest font-black rounded-xl h-12">
                                <Download className="w-4 h-4 mr-2" /> Download QR Code
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-dashed border-white/10">
                    <Fingerprint className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <h3 className="text-white font-black uppercase italic tracking-tight text-xl">No active credentials</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Request verification to receive your first anchor</p>
                </div>
            )}
        </div>
    );
}
