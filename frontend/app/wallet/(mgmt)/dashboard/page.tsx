"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { holderService } from "@/lib/holder-service";
import {
    Wallet, Fingerprint, ShieldCheck,
    Activity, History, Zap, ArrowUpRight,
    Search, Filter, Smartphone, Database, Shield,
    Settings, UserPlus, QrCode, Download, Eye, BadgeCheck, Globe, Lock as LockIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletDashboard() {
    const { backendProfile } = useAuth();
    const [stats, setStats] = useState({
        credentialsCount: 0,
        activityCount: 0,
        verificationCount: 0,
        lastActivity: null as any
    });
    const [history, setHistory] = useState<any[]>([]);
    const [latestRequest, setLatestRequest] = useState<any>(null);
    const [credentials, setCredentials] = useState<any[]>([]);
    const [allRequests, setAllRequests] = useState<any[]>([]);

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;

        const unsubscribeStats = holderService.getStats(backendProfile.firebase_uid, setStats);
        const unsubscribeHistory = holderService.subscribeToHistory(backendProfile.firebase_uid, setHistory);
        const unsubscribeLatestReq = holderService.subscribeToLatestRequest(backendProfile.firebase_uid, setLatestRequest);
        const unsubscribeCreds = holderService.subscribeToCredentials(backendProfile.firebase_uid, setCredentials);
        const unsubscribeAllReqs = holderService.subscribeToRequests(backendProfile.firebase_uid, setAllRequests);

        return () => {
            unsubscribeStats();
            unsubscribeHistory();
            unsubscribeLatestReq();
            unsubscribeCreds();
            unsubscribeAllReqs();
        };
    }, [backendProfile]);

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

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-2xl h-14 overflow-x-auto w-full justify-start md:justify-center no-scrollbar">
                    <TabsTrigger value="overview" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="credentials" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">My Credentials</TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Request Status</TabsTrigger>
                    <TabsTrigger value="proofs" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Generate Proof</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Activity History</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Settings</TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW CONTENT --- */}
                <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Credentials Owned", value: stats.credentialsCount, icon: Fingerprint, color: "text-blue-400", sub: "Verified Anchors" },
                            { title: "Active Proofs", value: "Real-time", icon: Zap, color: "text-amber-400", sub: "Ephemeral Generation" },
                            { title: "Verification Count", value: stats.verificationCount, icon: ShieldCheck, color: "text-emerald-400", sub: "Historical Proofs" },
                            { title: "Last Activity", value: stats.lastActivity ? (stats.lastActivity.toDate ? stats.lastActivity.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(stats.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : "N/A", icon: Activity, color: "text-rose-400", sub: "Self-Custody Logs" }
                        ].map((stat, i) => (
                            <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-emerald-500/20 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.title}</CardTitle>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-wider">{stat.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        <Card className="lg:col-span-12 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border-none shadow-2xl relative overflow-hidden group rounded-[2.5rem]">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <ShieldCheck className="w-80 h-80 text-black rotate-12" />
                            </div>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                            <div className="relative p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                                <Smartphone className="w-6 h-6 text-white" />
                                            </div>
                                            <Badge className={cn(
                                                "border-none text-[9px] uppercase font-black px-4 py-1.5 h-auto",
                                                latestRequest?.status === "approved" ? "bg-emerald-400 text-emerald-900" :
                                                    latestRequest?.status === "pending" ? "bg-amber-400 text-amber-900" :
                                                        latestRequest?.status === "rejected" ? "bg-rose-400 text-white" : "bg-white/20 text-white"
                                            )}>
                                                {latestRequest?.status || "Unverified Unit"}
                                            </Badge>
                                        </div>
                                        <h2 className="text-white text-4xl font-black tracking-tighter leading-none mb-2">
                                            {backendProfile?.name || "Holder Root"}
                                        </h2>
                                        <p className="text-white/60 text-xs font-bold font-mono tracking-tighter uppercase">DID: did:privaseal:{backendProfile?.firebase_uid?.substring(0, 16)}</p>
                                    </div>
                                    <div className="space-y-2 max-w-xs">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Storage Integrity</p>
                                            <span className="text-white font-black text-lg italic">100%</span>
                                        </div>
                                        <Progress value={100} className="h-2 bg-black/20" indicatorClassName="bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/wallet/request">
                                        <Button
                                            disabled={latestRequest?.status === "pending" || latestRequest?.status === "approved"}
                                            className="h-14 px-10 bg-white text-emerald-900 hover:bg-emerald-50 disabled:bg-white/20 disabled:text-white/40 font-black uppercase text-xs tracking-widest rounded-2xl"
                                        >
                                            {latestRequest?.status === "pending" ? "Review in Progress" : latestRequest?.status === "approved" ? "Identity Verified" : "Request Identity"}
                                        </Button>
                                    </Link>
                                    <Link href="/wallet/proof">
                                        <Button
                                            disabled={latestRequest?.status !== "approved"}
                                            variant="outline"
                                            className="h-14 px-10 border-white/20 text-white hover:bg-white/10 disabled:opacity-30 font-black uppercase text-xs tracking-widest rounded-2xl"
                                        >
                                            Generate ZK-Proof
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- CREDENTIALS CONTENT --- */}
                <TabsContent value="credentials" className="focus-visible:outline-none">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {credentials.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-dashed border-white/10">
                                <Fingerprint className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                                <h3 className="text-white font-black uppercase italic tracking-tight text-xl">No active credentials</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Request verification to receive your first anchor</p>
                            </div>
                        ) : (
                            credentials.map((cred) => (
                                <Card key={cred.id} className="bg-slate-900/60 border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all rounded-[2rem] shadow-2xl">
                                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                                <BadgeCheck className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <Badge className="bg-emerald-500 text-white border-none text-[8px] uppercase font-black px-2.5">Verified</Badge>
                                        </div>
                                        <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight mt-4">{cred.credentialType}</CardTitle>
                                        <CardDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{cred.issuer}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global DID</span>
                                                <span className="text-[10px] font-mono text-emerald-500/80">did:privaseal:{cred.holderUID.substring(0, 10)}...</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Issued On</span>
                                                <span className="text-[10px] font-bold text-slate-400">{cred.issuedAt ? (cred.issuedAt.toDate ? cred.issuedAt.toDate().toLocaleDateString() : new Date(cred.issuedAt).toLocaleDateString()) : '---'}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="flex-1 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 rounded-xl font-black uppercase text-[9px] tracking-widest h-10">
                                                        <QrCode className="w-3.5 h-3.5 mr-2" /> Show Proof
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] flex flex-col items-center p-10">
                                                    <DialogHeader className="w-full text-center">
                                                        <DialogTitle className="text-2xl font-black italic uppercase italic">Verified Access QR</DialogTitle>
                                                        <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-1">Scan to verify decentralized identity</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="p-6 bg-white rounded-3xl mt-6 shadow-2xl shadow-emerald-500/20">
                                                        <QRCodeCanvas value={cred.credentialId} size={200} level="H" />
                                                    </div>
                                                    <div className="mt-8 space-y-2 w-full">
                                                        <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global DID</span>
                                                            <span className="text-[10px] font-mono text-emerald-400">did:privaseal:{cred.holderUID.substring(0, 16)}</span>
                                                        </div>
                                                        <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valid Until</span>
                                                            <span className="text-[10px] font-black text-white">2030-12-31</span>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 rounded-xl text-slate-400 hover:text-white">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* --- REQUESTS CONTENT --- */}
                <TabsContent value="requests" className="focus-visible:outline-none">
                    <Card className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="px-8 py-6 border-b border-white/5">
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-500" /> Identity verification history
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                                            <th className="px-8 py-5">Request ID</th>
                                            <th className="px-8 py-5">Submitted On</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {allRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No requests sent</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            allRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="px-8 py-5 text-[10px] font-black text-white font-mono uppercase">
                                                        {req.requestID || req.requestId || req.id.substring(0, 10).toUpperCase()}
                                                    </td>
                                                    <td className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                                                        {req.timestamp ? (req.timestamp.toDate ? req.timestamp.toDate().toLocaleString() : new Date(req.timestamp).toLocaleString()) : 'Just now'}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge className={cn(
                                                            "border-none text-[9px] uppercase font-black px-3 py-1",
                                                            req.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                                                                req.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                                                                    "bg-rose-500/10 text-rose-400"
                                                        )}>
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase text-slate-500 hover:text-white tracking-widest">
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PROOFS CONTENT --- */}
                <TabsContent value="proofs" className="focus-visible:outline-none">
                    <div className="max-w-4xl mx-auto text-center space-y-10 py-10">
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 mb-6 border border-emerald-500/20">
                                <Zap className="w-10 h-10" />
                            </div>
                            <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter">Zero-Knowledge Proof Generator</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg mx-auto">
                                Generate temporary, mathematically verifiable proofs from your credentials without revealing the actual data.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-slate-900 p-8 border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all cursor-pointer group shadow-2xl">
                                <BadgeCheck className="w-10 h-10 text-slate-600 group-hover:text-emerald-500 transition-colors mb-6" />
                                <h3 className="text-white font-black uppercase italic text-lg tracking-tight mb-2">Proof of Identity</h3>
                                <p className="text-slate-500 text-xs font-medium">Generate a simple proof that you are a verified human node without sharing your name or ID.</p>
                                <Button className="w-full mt-8 bg-white/5 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">Generate Proof</Button>
                            </Card>
                            <Card className="bg-slate-900 p-8 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all cursor-pointer group shadow-2xl">
                                <Globe className="w-10 h-10 text-slate-600 group-hover:text-blue-500 transition-colors mb-6" />
                                <h3 className="text-white font-black uppercase italic text-lg tracking-tight mb-2">Proof of Location</h3>
                                <p className="text-slate-500 text-xs font-medium">Verify your citizenship or residency status for global service access without leaking your address.</p>
                                <Button className="w-full mt-8 bg-white/5 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">Generate Proof</Button>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- ACTIVITY HISTORY --- */}
                <TabsContent value="activity" className="focus-visible:outline-none">
                    <Card className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="px-8 py-6 border-b border-white/5">
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-500" /> Complete Operation Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                                            <th className="px-8 py-5">Timestamp</th>
                                            <th className="px-8 py-5">Action</th>
                                            <th className="px-8 py-5">Details</th>
                                            <th className="px-8 py-5 text-right">Privacy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No history found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="px-8 py-5 text-[10px] font-medium text-slate-500">
                                                        {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()) : "Just now"}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge className="bg-slate-950 border-white/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs text-slate-300 font-medium">{log.details}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-500/40 ml-auto" />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SETTINGS CONTENT --- */}
                <TabsContent value="settings" className="focus-visible:outline-none">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Card className="bg-slate-900/60 border-white/5 p-8 rounded-[2rem] shadow-2xl">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8">Node configurations</h3>
                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white tracking-wide uppercase">Hardware Encryption</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Use device secure enclave for proofs</p>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white tracking-wide uppercase">Auto-Revocation</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Wipe local keys if unauthorized access detected</p>
                                    </div>
                                    <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full" />
                                    </div>
                                </div>
                                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald-500/10">
                                    Save Configurations
                                </Button>
                                <Button variant="ghost" className="w-full h-14 text-rose-500 hover:bg-rose-500/10 font-black uppercase text-xs tracking-widest rounded-2xl">
                                    Factory Reset Wallet
                                </Button>
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
