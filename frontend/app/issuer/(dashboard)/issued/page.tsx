"use client";

import { useState, useMemo } from "react";
import {
    Search, Filter, Download,
    XCircle, CheckCircle2, AlertCircle, Trash2,
    Eye, ChevronDown, ListFilter, SlidersHorizontal,
    ArrowUpDown, MoreHorizontal, User, ShieldAlert,
    Calendar, Tag, ShieldCheck, Clock, FileText,
    ArrowRight
} from "lucide-react";
export interface Credential {
    id: string;
    type: string;
    status: "Active" | "Revoked" | "Pending";
    issuer: string;
    description: string;
    category: string;
    holderId: string;
    issuedDate: string;
    expiryDate: string;
    accessLevel: number;
    attributes: Record<string, string | number>;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export default function IssuedCredentialsPage() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const revokeCredential = (id: string) => {
        setCredentials(prev => prev.map(c => c.id === id ? { ...c, status: "Revoked" } : c));
    };
    const bulkRevoke = (ids: string[]) => {
        setCredentials(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: "Revoked" } : c));
    };
    const { toast } = useToast();

    // Filtering/Sorting State
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredCreds = useMemo(() => {
        return credentials.filter(c => {
            const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
                c.holderId.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || c.status === statusFilter;
            const matchesType = typeFilter === "all" || c.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [credentials, search, statusFilter, typeFilter]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredCreds.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(i => i !== id));
        }
    };

    const handleBulkRevoke = () => {
        if (selectedIds.length === 0) return;
        bulkRevoke(selectedIds);
        toast({
            title: "Bulk Revocation Successful",
            description: `Revoked ${selectedIds.length} credentials successfully.`,
            variant: "destructive"
        });
        setSelectedIds([]);
    };

    const handleExportSelected = () => {
        const data = credentials.filter(c => selectedIds.includes(c.id));
        const csv = [
            ["ID", "Holder ID", "Type", "Issued Date", "Status", "Expiry"].join(","),
            ...data.map(c => [c.id, c.holderId, c.type, c.issuedDate, c.status, c.expiryDate].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `issued_credentials_${new Date().toISOString()}.csv`);
        a.click();
        toast({ title: "Export Started", description: "Your CSV file is being generated." });
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Credential Registry</h1>
                    <p className="text-slate-400 font-medium italic">Full lifecycle management of issued BBS+ identity proofs.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300 mr-2 bg-slate-900/80 p-1 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-blue-400 px-3 uppercase tracking-widest">
                                {selectedIds.length} Selected
                            </span>
                            <Button onClick={handleBulkRevoke} variant="destructive" size="sm" className="h-9 px-4 font-black gap-2 rounded-xl text-[10px] uppercase tracking-widest">
                                <ShieldAlert className="w-3.5 h-3.5" /> Bulk Revoke
                            </Button>
                            <Button onClick={handleExportSelected} variant="secondary" size="sm" className="h-9 px-4 font-black bg-slate-800 text-slate-300 gap-2 rounded-xl text-[10px] uppercase tracking-widest">
                                <Download className="w-3.5 h-3.5" /> Export
                            </Button>
                            <Button onClick={() => setSelectedIds([])} variant="ghost" size="icon" className="w-9 h-9 text-slate-500 hover:text-white">
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" className="bg-slate-900/50 border-white/10 text-slate-400 hover:text-white h-11 px-6 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                        <Download className="w-4 h-4" /> Export All Registry
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search IDs, Holders, or descriptions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-11 bg-slate-950/50 border-white/10 text-white h-12 rounded-2xl focus:ring-2 focus:ring-blue-500/50 font-medium"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    <Button variant="ghost" className="h-12 px-4 rounded-2xl bg-slate-950/50 border border-white/10 text-slate-400 gap-2 hover:bg-white/5 transition-all">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                        <ChevronDown className="w-3 h-3 ml-2" />
                    </Button>
                    <Button variant="ghost" className="h-12 px-4 rounded-2xl bg-slate-950/50 border border-white/10 text-slate-400 gap-2 hover:bg-white/5 transition-all">
                        <ListFilter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
                        <ChevronDown className="w-3 h-3 ml-2" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 border border-white/10">
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl group">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 w-12">
                                    <Checkbox
                                        checked={selectedIds.length === filteredCreds.length && filteredCreds.length > 0}
                                        onCheckedChange={(v) => handleSelectAll(v as boolean)}
                                        className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
                                    />
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
                                        Credential Identity <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Security Tier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Health</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCreds.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-800/20 rounded-[2rem] flex items-center justify-center text-slate-700 border border-white/5">
                                                <FileText className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <p className="text-white font-black uppercase tracking-tight">Zero Results Found</p>
                                                <p className="text-slate-500 text-xs font-medium italic">Adjust filters to broaden your search.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCreds.map((c) => (
                                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group/row">
                                        <td className="px-8 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(c.id)}
                                                onCheckedChange={(v) => handleSelectOne(c.id, v as boolean)}
                                                className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
                                            />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-black text-blue-400 uppercase italic tracking-wider">{c.id}</span>
                                                    <Badge className="bg-slate-950 border-white/10 text-[9px] font-black uppercase py-0 px-2 rounded-md">
                                                        {c.category}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                        <User className="w-3 h-3 text-slate-600" /> {c.holderId}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold tracking-tight">
                                                        <Tag className="w-3 h-3 text-slate-600" /> {c.type}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] font-black px-3 py-1 bg-white/5 border-white/10 text-slate-400">
                                                    Level {c.accessLevel}
                                                </Badge>
                                                <div className="flex gap-0.5">
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={i} className={`w-1.5 h-1 rounded-full ${i < 3 ? "bg-blue-500" : "bg-slate-800"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-300">
                                                    {new Date(c.issuedDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(c.issuedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <Badge className={`
                                                    text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border w-fit
                                                    ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_#10b98115]" :
                                                        c.status === "Revoked" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-slate-500/10 text-slate-400 border-white/10"}
                                                `}>
                                                    {c.status}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1 h-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Network Verified</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white min-w-[200px] p-2 rounded-[1.5rem] shadow-2xl backdrop-blur-2xl">
                                                    <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Credential Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-white/5 mx-[-8px] my-2" />
                                                    <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer focus:bg-white/10 group">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20">
                                                            <Eye className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-white uppercase tracking-tight">Inspect Proof</span>
                                                            <span className="text-[9px] text-slate-500 uppercase font-black">View raw attributes</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => revokeCredential(c.id)}
                                                        className="gap-3 px-3 py-3 rounded-xl cursor-pointer focus:bg-rose-500/10 group"
                                                    >
                                                        <div className="p-2 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20">
                                                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-rose-400 uppercase tracking-tight">Revoke Anchor</span>
                                                            <span className="text-[9px] text-rose-900 uppercase font-black">Crypto-invalidation</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 mx-[-8px] my-2" />
                                                    <DropdownMenuItem className="gap-3 px-3 py-3 rounded-xl cursor-pointer focus:bg-white/10 group">
                                                        <div className="p-2 bg-slate-800 rounded-lg">
                                                            <Download className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">Export Pack</span>
                                                            <span className="text-[9px] text-slate-600 uppercase font-black">Signed JSON-LD</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Registry Page <span className="text-white">1</span> of <span className="text-white">1</span> — Total <span className="text-blue-500 tabular-nums">{filteredCreds.length}</span> Objects
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" disabled className="h-10 px-6 rounded-xl border-white/5 bg-slate-950/50 text-slate-600 font-black uppercase text-[10px] tracking-widest">
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" disabled className="h-10 px-6 rounded-xl border-white/5 bg-slate-950/50 text-slate-600 font-black uppercase text-[10px] tracking-widest">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
