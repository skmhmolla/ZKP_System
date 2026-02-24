"use client";

import { useMemo, useState } from "react";
import {
    ShieldAlert, Search, Filter, Trash2,
    RefreshCcw, AlertTriangle, ShieldCheck,
    Clock, MoreHorizontal, User, Tag,
    Calendar, CheckCircle2, XCircle, Info
} from "lucide-react";
export interface Credential {
    id: string;
    type: string;
    status: "Active" | "Revoked" | "Pending";
    issuer: string;
    date: string;
    holderId?: string;
    expiryDate?: string;
    accessLevel?: number;
    attributes: Record<string, string | number>;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function RevocationManagerPage() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const revokeCredential = (id: string) => {
        setCredentials(prev => prev.filter(c => c.id !== id));
    };
    const { toast } = useToast();

    const [search, setSearch] = useState("");
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const activeCredentials = useMemo(() => {
        return credentials.filter(c =>
            c.status === "Active" &&
            (c.id.toLowerCase().includes(search.toLowerCase()) ||
                c.holderId?.toLowerCase().includes(search.toLowerCase()) ||
                c.type?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [credentials, search]);

    const handleRevoke = async (id: string) => {
        setRevokingId(id);
        // Simulate cryptographic invalidation
        await new Promise(r => setTimeout(r, 1500));
        revokeCredential(id);
        setRevokingId(null);
        toast({
            title: "Credential Revoked",
            description: "Signature has been added to the global revocation list.",
            variant: "destructive"
        });
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Revocation Manager</h1>
                    <p className="text-slate-400 font-medium italic">Invalidate existing ZK-Credentials without identity disclosure.</p>
                </div>
                <div className="flex gap-4">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-4 py-2 rounded-xl h-fit w-fit font-black uppercase text-[10px] tracking-[0.1em]">
                        <ShieldAlert className="w-3 h-3 mr-2" /> Global CRL Active
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search and List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search by Credential ID, Holder ID, or Attribute..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 bg-slate-950/50 border-white/10 text-white h-14 rounded-2xl focus:ring-2 focus:ring-rose-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Credential Details</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Security Level</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeCredentials.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <ShieldCheck className="w-12 h-12 text-slate-800" />
                                                    <p className="text-slate-500 text-sm font-medium">No active revocable credentials found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        activeCredentials.map((cred) => (
                                            <tr key={cred.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-black text-white italic">{cred.id}</span>
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase text-blue-400 border-blue-500/20 px-1.5 py-0">
                                                                {cred.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {cred.holderId}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Exp: {cred.expiryDate}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <Badge className="bg-slate-950 border-white/10 text-[10px] font-black uppercase text-slate-400">
                                                            Tier {cred.accessLevel}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleRevoke(cred.id)}
                                                        disabled={revokingId === cred.id}
                                                        className="bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2"
                                                    >
                                                        {revokingId === cred.id ? (
                                                            <RefreshCcw className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3" />
                                                        )}
                                                        Revoke
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <Card className="bg-rose-600/5 border-rose-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <AlertTriangle className="w-20 h-20 text-rose-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest">Revocation Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium mt-[-10px]">
                                Revocation on PrivaSeal uses a non-interactive accumulation method. When a credential ID is revoked:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    { text: "Identity remains private", icon: CheckCircle2 },
                                    { text: "Globally broadcast to nodes", icon: CheckCircle2 },
                                    { text: "Verifiers see 'Revoked' result", icon: CheckCircle2 },
                                    { text: "Cannot be undone manually", icon: XCircle, color: "text-amber-500" },
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 text-[10px] font-bold uppercase tracking-tight items-start">
                                        <item.icon className={`w-4 h-4 ${item.color || "text-emerald-500"} shrink-0`} />
                                        <span className="text-slate-300">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security Notice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    "Revocation does NOT reveal user identity. It only invalidates the cryptographic anchor associated with the credential serial number."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
