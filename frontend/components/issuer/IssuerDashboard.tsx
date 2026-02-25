"use client";

import { useAuth } from "@/context/AuthContext";
import { useIssuerProfile } from "@/context/IssuerContext";
import {
    Users, ShieldCheck, ShieldAlert, Activity,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, Plus, CheckCircle2, XCircle, Loader2,
    Building2, Fingerprint, Shield, Info, Zap,
    TrendingDown, LayoutDashboard, Database,
    User, Lock, ArrowRight, Key, Eye, FileText
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import { issuerService } from "@/lib/issuer-service";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";

// Mock data for charts
const activityData = [
    { name: "01 Feb", issued: 12, checks: 45 },
    { name: "02 Feb", issued: 19, checks: 52 },
    { name: "03 Feb", issued: 15, checks: 38 },
    { name: "04 Feb", issued: 22, checks: 65 },
    { name: "05 Feb", issued: 30, checks: 48 },
    { name: "06 Feb", issued: 25, checks: 55 },
    { name: "07 Feb", issued: 28, checks: 72 },
];

function StatCard({ title, value, subValue, trend, icon: Icon, color }: any) {
    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 pointer-events-none ${color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</CardTitle>
                <div className={`p-2 rounded-xl bg-slate-800/50 text-slate-300 group-hover:${color.replace('bg-', 'text-')} transition-colors`}>
                    <Icon className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</div>
                    {trend && (
                        <div className={`flex items-center text-[10px] font-bold ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{subValue}</p>
            </CardContent>
        </Card>
    );
}

export default function IssuerDashboard() {
    const { toast } = useToast();
    const { backendProfile } = useAuth();
    const { issuerProfile } = useIssuerProfile();
    const [statsData, setStatsData] = useState({
        totalIssued: 0,
        activeCredentials: 0,
        activePercent: 0,
        typesSupported: 0,
        pendingRequests: 0
    });
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    useEffect(() => {
        // 1️⃣ Live Stats Subscription
        const unsubscribeStats = issuerService.subscribeToStats((stats: any) => {
            setStatsData(prev => ({
                ...prev,
                ...stats,
            }));
        });

        // 2️⃣ Pending Requests Subscription (Real-time)
        const unsubscribeRequests = issuerService.subscribeToPendingRequests((requests: any[]) => {
            setPendingRequests(requests);
        });

        // 3️⃣ Audit Logs Subscription
        const unsubscribeLogs = issuerService.subscribeToAuditLogs((logs: any[]) => {
            setAuditLogs(logs);
        }, 5);

        setLoading(false);

        return () => {
            unsubscribeStats();
            unsubscribeRequests();
            unsubscribeLogs();
        };
    }, []);

    const handleApprove = async (id: string) => {
        if (!backendProfile?.email) return;
        setIsProcessing(id);
        try {
            await issuerService.approveRequest(id, backendProfile.email);
            toast({
                title: "Request Approved",
                description: `Identity Verification for ID: ${id} is completed.`,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Approval Failed",
                description: "Failed to finalize encryption of identity card.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!backendProfile?.email) return;
        setIsProcessing(id);
        try {
            await issuerService.rejectRequest(id, backendProfile.email);
            toast({
                title: "Request Rejected",
                description: `Application ${id} has been denied access to the registry.`,
            });
        } catch (err) {
            toast({
                title: "Rejection Failed",
                description: "Action could not be synchronized with the node.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(null);
        }
    };

    const stats = {
        total: statsData.totalIssued,
        active: statsData.activeCredentials,
        revoked: statsData.totalIssued - statsData.activeCredentials,
        checks: statsData.activePercent,
        growth: 12.5
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic text-shadow-glow flex items-center gap-4">
                        <div className="w-3 h-12 bg-blue-600 rounded-full" />
                        ISSUER <span className="text-blue-500">DASHBOARD</span>
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        <span className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Node Operational
                        </span>
                        <span className="opacity-50">Protocol: PrivaSeal-v2</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Link href="/issuer/issue">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black gap-3 h-14 px-10 rounded-2xl shadow-2xl shadow-blue-500/40 uppercase text-[10px] tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" /> Generate Credential
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ISSUER IDENTITY PANEL */}
                <Card className="lg:col-span-8 bg-white/5 border-white/10 backdrop-blur-2xl relative overflow-hidden group rounded-[2.5rem] shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <Building2 className="w-64 h-64 text-white" />
                    </div>
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-4 py-1.5 rounded-full">Root Authority</Badge>
                                <CardTitle className="text-4xl font-black text-white tracking-tighter leading-none mb-3 italic uppercase truncate max-w-[500px]">
                                    {issuerProfile.organizationName}
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-bold uppercase text-[11px] tracking-widest opacity-60 italic">Node: {issuerProfile.adminEmail}</CardDescription>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-emerald-500/5">
                                <CheckCircle2 className="w-4 h-4" /> SECURE NODE
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-6 bg-black/20 rounded-[2rem] border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-blue-500" /> Root DID
                                </p>
                                <p className="text-xs font-mono text-white/80 bg-black/40 p-3 rounded-xl border border-white/5 truncate">{issuerProfile.issuerDID}</p>
                            </div>
                            <div className="space-y-3 p-6 bg-black/20 rounded-[2rem] border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-500" /> Logic Scheme
                                </p>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-black uppercase px-3 py-1">ZKP-GIS-2</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KEY STATUS */}
                <Card className="lg:col-span-4 bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Lock className="w-40 h-40 text-white" />
                    </div>
                    <CardHeader className="p-8">
                        <CardTitle className="text-white text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3 italic">
                            <Key className="w-5 h-5 text-blue-500" /> Vault Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Signing Key</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 text-shadow-glow-emerald">ACTIVE</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Public Buffer</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">SYNCED</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                <StatCard title="Total Issued" value={stats.total} subValue="Secure Identities" icon={ShieldCheck} color="bg-blue-500" />
                <StatCard title="Active Proofs" value={stats.active} subValue="ZKP Credentials" icon={Activity} color="bg-emerald-500" />
                <StatCard title="Global Checks" value={stats.checks} subValue="Verification Logs" icon={Clock} color="bg-purple-500" />
                <StatCard title="Queue" value={pendingRequests.length} subValue="Pending Approval" icon={Users} color="bg-amber-500" />
            </div>

            {/* --- VERIFICATION PIPELINE --- */}
            {pendingRequests.length > 0 && (
                <Card className="bg-slate-900 border-amber-500/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-2 shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-amber-500/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-2xl font-black uppercase italic tracking-tighter">Verification Pipeline</CardTitle>
                                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Live Identity Authentication Queue</CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-500 border-none px-4 py-1.5 rounded-full font-black text-xs uppercase italic">{pendingRequests.length} Pending</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-black text-xl border border-white/5 shadow-inner">
                                            {req.fullName?.charAt(0) || req.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg tracking-tight">{req.fullName || req.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">ID: {req.id}</span>
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Fingerprint className="w-3 h-3" /> {req.documentType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <Button
                                            onClick={() => handleReject(req.id)}
                                            disabled={isProcessing === req.id}
                                            variant="outline"
                                            className="h-12 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl px-6 font-black uppercase text-[10px] tracking-widest transition-all"
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleApprove(req.id)}
                                            disabled={isProcessing === req.id}
                                            className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
                                        >
                                            {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Audit Logs */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px]">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-lg font-black uppercase tracking-widest italic flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-500" /> System Audit Trail
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-6">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="flex gap-5 group items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" />
                                <div className="flex-1 flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 group-hover:bg-white/[0.04] transition-all">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-white/90 tracking-widest uppercase italic">{log.action.replace('_', ' ')}</span>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{log.detail}</p>
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-mono font-bold">
                                        {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp)).toLocaleTimeString() : '---'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
