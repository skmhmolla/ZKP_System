"use client";

import { useState, useEffect } from "react";
import { issuerService } from "@/lib/issuer-service";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search, Filter, FileSpreadsheet, FileJson,
    MoreVertical, ShieldAlert, CheckCircle2,
    Clock, Download, Loader2, ArrowUpDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function IssuedCredentialsPage() {
    const { toast } = useToast();
    const { backendProfile } = useAuth();
    const [credentials, setCredentials] = useState<any[]>([]);
    const [filteredCreds, setFilteredCreds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        const unsubscribe = issuerService.subscribeToIssuedCredentials((creds) => {
            setCredentials(creds);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let results = credentials;
        if (searchTerm) {
            results = results.filter(c =>
                c.credentialId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.holderUID?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (typeFilter !== "All") {
            results = results.filter(c => c.credentialType === typeFilter);
        }
        setFilteredCreds(results);
    }, [searchTerm, typeFilter, credentials]);

    const handleRevoke = async (id: string) => {
        if (!backendProfile?.email) return;
        if (!confirm("Are you sure you want to revoke this credential? This action is permanent.")) return;

        try {
            await issuerService.revokeCredential(id, backendProfile.email);
            toast({
                title: "Credential Revoked",
                description: "The registry has been updated.",
            });
        } catch (err) {
            toast({
                title: "Revocation Failed",
                description: "Check connection or permissions.",
                variant: "destructive"
            });
        }
    };

    const exportCSV = () => {
        const headers = ["Credential ID", "Holder UID", "Type", "Status", "Issued Date", "Expiry"];
        const rows = filteredCreds.map(c => [
            c.credentialId,
            c.holderUID,
            c.credentialType,
            c.status,
            c.issuedAt?.toDate ? c.issuedAt.toDate().toISOString() : "N/A",
            c.expiryDate
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "issued_credentials.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Issued <span className="text-blue-500">History</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Comprehensive registry of all active and revoked credentials
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={exportCSV}
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-slate-300 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl gap-2"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button
                        disabled
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-slate-300 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl gap-2 opacity-50 cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </Button>
                </div>
            </div>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 max-w-md relative">
                            <Search className="absolute left-4 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search by ID or Holder..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 bg-black/40 border-white/10 rounded-2xl h-12 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
                                {["All", "Identity", "Health", "Age Proof"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Credential ID</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Holder UID</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Issued On</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                            <p className="mt-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Hydrating Registry...</p>
                                        </td>
                                    </tr>
                                ) : filteredCreds.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center">
                                            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No matching credentials found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCreds.map((cred) => (
                                        <tr key={cred.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-6">
                                                <span className="text-[10px] font-mono text-slate-400">#{cred.credentialId?.substring(0, 12)}...</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-white font-bold text-sm tracking-tight">{cred.holderUID}</span>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[9px] font-black uppercase tracking-widest px-3">
                                                    {cred.credentialType}
                                                </Badge>
                                            </td>
                                            <td className="p-6">
                                                {cred.status === "revoked" || cred.status === "Revoked" ? (
                                                    <Badge className="bg-rose-500/10 text-rose-500 border-none uppercase text-[9px] font-black tracking-widest">Revoked</Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] font-black tracking-widest">Issued</Badge>
                                                )}
                                            </td>
                                            <td className="p-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    {cred.issuedAt?.toDate ? cred.issuedAt.toDate().toLocaleDateString() : "N/A"}
                                                </div>
                                            </td>
                                            <td className="p-6 whitespace-nowrap">
                                                <span className="text-xs text-slate-400 font-bold">{cred.expiryDate || "Never"}</span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                                                            <MoreVertical className="h-4 w-4 text-slate-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                                                        <DropdownMenuItem className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer text-[10px] font-black uppercase">
                                                            View ZK Proof
                                                        </DropdownMenuItem>
                                                        {(cred.status !== "revoked" && cred.status !== "Revoked") && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleRevoke(cred.id)}
                                                                className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer text-[10px] font-black uppercase"
                                                            >
                                                                Revoke Access
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
