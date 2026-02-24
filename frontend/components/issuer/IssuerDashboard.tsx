"use client";

import { useAuth } from "@/context/AuthContext";
import {
    Users, ShieldCheck, ShieldAlert, Activity,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, Plus, CheckCircle2, XCircle, Loader2,
    Building2, Fingerprint, Shield, Info, Zap,
    TrendingDown, LayoutDashboard, Database,
    User, Lock, ArrowRight, Key
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    Cell, PieChart, Pie
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/services/api";

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
    const { backendProfile } = useAuth();
    const [statsData, setStatsData] = useState({
        totalIssued: 0,
        activeCredentials: 0,
        activePercent: 0,
        typesSupported: 0
    });
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await api.issuer.getStats();
                setStatsData(stats);

                // Fetch audit logs
                const auditRes = await fetch("/api/privaseal/audit?per_page=5");
                if (auditRes.ok) {
                    const data = await auditRes.json();
                    setAuditLogs(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

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
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic text-shadow-glow">
                        ISSUER <span className="text-blue-500">NODE</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 flex items-center gap-3 uppercase text-[10px] tracking-[0.3em]">
                        <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Certified Operational
                        </span>
                        System Security: Pulse Optimal
                    </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Link href="/benchmarks">
                        <Button variant="outline" className="bg-white/5 border-white/10 text-slate-400 hover:text-white gap-3 h-14 px-8 rounded-2xl backdrop-blur-md transition-all font-bold uppercase text-[10px] tracking-widest">
                            <Zap className="w-4 h-4 text-blue-400" /> Performance Test
                        </Button>
                    </Link>
                    <Link href="/issuer/issue">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black gap-3 h-14 px-10 rounded-2xl shadow-2xl shadow-blue-500/40 uppercase text-[10px] tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" /> Issue Credential
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1️⃣ ISSUER IDENTITY PANEL */}
                <Card className="lg:col-span-8 bg-white/5 border-white/10 backdrop-blur-2xl relative overflow-hidden group rounded-[2.5rem] shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <Building2 className="w-64 h-64 text-white" />
                    </div>
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-4 py-1.5 rounded-full">Root Authority</Badge>
                                <CardTitle className="text-4xl font-black text-white tracking-tighter leading-none mb-3 italic">
                                    {backendProfile?.name || "PRIVASEAL ROOT ISSUER"}
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-bold uppercase text-[11px] tracking-widest opacity-60">Certified Organization Registry Node #10292</CardDescription>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-emerald-500/5">
                                <CheckCircle2 className="w-4 h-4" /> Trusted Node
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-6 bg-black/20 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-colors">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-blue-500" /> Decentralized Identifier (DID)
                                </p>
                                <p className="text-xs font-mono text-white/80 bg-black/40 p-3 rounded-xl border border-white/5 truncate">did:privaseal:issuer:0x8821...XP91</p>
                            </div>
                            <div className="space-y-3 p-6 bg-black/20 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-colors">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-500" /> Signature Algorithm
                                </p>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-black uppercase px-3 py-1">BBS+ Scheme</Badge>
                                    <span className="text-xs font-bold text-slate-400 italic">Multi-Message Ready</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem]">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-xs text-slate-400 font-bold italic leading-relaxed">
                                "This Issuer Node signs attribute-based credentials. Per ZK-Protocol standards, the issuer has **zero visibility** into when or where credentials are used."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2️⃣ KEY MANAGEMENT PANEL */}
                <Card className="lg:col-span-4 bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                        <Lock className="w-40 h-40 text-white" />
                    </div>
                    <CardHeader className="p-8">
                        <CardTitle className="text-white text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3 italic">
                            <Key className="w-5 h-5 text-blue-500" /> Node Keys
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold text-[10px] uppercase">Active Cryptographic Vault</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            {[
                                { label: "Master Secret Key", status: "Secured", icon: ShieldCheck, color: "text-emerald-400" },
                                { label: "Public Verifying Key", status: "Broadcasted", icon: Activity, color: "text-blue-400" },
                                { label: "Revocation Key", status: "Encrypted", icon: Lock, color: "text-slate-400" },
                            ].map((key, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-slate-800 ${key.color}`}>
                                            <key.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{key.label}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${key.color}`}>{key.status}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/issuer/keys">
                            <Button className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black uppercase text-[10px] tracking-widest transition-all">
                                Manage Root Keys
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Issued" value={stats.total} subValue="Attribute Groups Signatures" trend={stats.growth} icon={ShieldCheck} color="bg-blue-500" />
                <StatCard title="Active States" value={stats.active} subValue="Valid Anchor Proofs" trend={5.2} icon={Activity} color="bg-emerald-500" />
                <StatCard title="Revocations" value={stats.revoked} subValue="Blacklisted Public Keys" trend={-2.1} icon={ShieldAlert} color="bg-rose-500" />
                <StatCard title="24h Traffic" value={stats.checks} subValue="Node Verification Requests" trend={18.4} icon={Clock} color="bg-purple-500" />
            </div>

            {/* Charts & Audit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white text-2xl font-black uppercase italic tracking-tighter">Issuance Flux</CardTitle>
                            <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Platform Crypto-Volume</CardDescription>
                        </div>
                    </CardHeader>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                                <Area type="monotone" dataKey="issued" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorIssued)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-4 bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-lg font-black uppercase tracking-widest italic">Node Logs</CardTitle>
                        <Link href="/issuer/logs">
                            <Button variant="ghost" size="sm" className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/10">Archive</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-8 flex-1">
                        <div className="space-y-8">
                            {auditLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex gap-5 group">
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] group-hover:scale-125 transition-transform" />
                                        <div className="w-[1px] h-full bg-white/10 mt-2" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-black text-white/90 tracking-widest uppercase italic">{log.action.replace('_', ' ')}</span>
                                            <span className="text-[9px] text-slate-500 font-mono font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{log.detail}</p>
                                    </div>
                                </div>
                            ))}
                            {auditLogs.length === 0 && <p className="text-slate-600 text-[10px] font-bold uppercase text-center mt-10">No recent logs</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
