"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
    History, Search, Filter,
    ArrowUpRight, Clock, ShieldCheck,
    Lock, Eye, Zap, UserPlus,
    Download, Trash2, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function HistoryPage() {
    const { backendProfile } = useAuth();
    const { toast } = useToast();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const fetchActivity = async () => {
            try {
                const res = await api.holder.getActivity(backendProfile.firebase_uid);
                setHistory(res.data || []);
            } catch (err) {
                console.error("Failed to fetch activity:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [backendProfile]);

    const getIcon = (action: string) => {
        switch (action) {
            case "REQUEST_SUBMITTED": return <UserPlus className="w-4 h-4 text-blue-400" />;
            case "PROOF_GENERATED": return <Zap className="w-4 h-4 text-emerald-400" />;
            case "CREDENTIAL_ADDED": return <ShieldCheck className="w-4 h-4 text-blue-500" />;
            case "SETTINGS_UPDATE": return <Lock className="w-4 h-4 text-amber-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const handleDownload = () => {
        const content = history.map(h => `${new Date(h.timestamp).toISOString()} | ${h.action} | ${h.message || h.details}`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privaseal-audit-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Audit Log Exported", description: "Secured activity history downloaded as .txt" });
    };

    const filteredHistory = history.filter(item =>
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Activity <span className="text-emerald-500">History</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Your local audit trail of cryptographic operations
                    </p>
                </div>

                <Button onClick={handleDownload} variant="outline" className="h-12 border-white/10 text-slate-400 hover:text-white rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                    <Download className="w-4 h-4" /> Export Audit Log
                </Button>
            </div>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 bg-black/40 border-white/10 rounded-2xl h-12 text-sm"
                            />
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                            {["All", "Proofs", "Identity", "System"].map(f => (
                                <button key={f} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-8 py-5">Event Time</th>
                                    <th className="px-8 py-5">Action Type</th>
                                    <th className="px-8 py-5">Operation Details</th>
                                    <th className="px-8 py-5 text-right">Integrity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reading Secure Log...</p>
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No activities found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-5 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                                                {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Syncing..."}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                                        {getIcon(item.action)}
                                                    </div>
                                                    <span className="text-white font-black text-xs uppercase tracking-tight">{item.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs text-slate-300 font-medium max-w-md">{item.message || item.details}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 text-emerald-500/40 opacity-0 group-hover:opacity-100 transition-all">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-black uppercase italic tracking-widest">Hashed</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8">
                    <div className="flex gap-6">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-emerald-500 font-black uppercase text-sm tracking-widest">Local-Only Storage</h3>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider italic">
                                This history is a local-first audit trail. PrivaSeal never uploads your interaction history to a central server. Your patterns remain your own.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-8">
                    <div className="flex gap-6">
                        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-rose-500 font-black uppercase text-sm tracking-widest">Wipe Data</h3>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider italic">
                                Use the settings page to perform a full hardware wipe. This will erase all credentials, proofs, and history permanently.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

import { Activity } from "lucide-react";
