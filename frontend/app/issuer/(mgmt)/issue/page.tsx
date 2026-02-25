"use client";

import { useState, useEffect } from "react";
import { issuerService } from "@/lib/issuer-service";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Fingerprint, Plus, Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function IssueCredentialPage() {
    const { toast } = useToast();
    const { backendProfile } = useAuth();
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        holderUID: "",
        credentialType: "",
        expiryDate: "",
        notes: ""
    });

    useEffect(() => {
        const unsubscribe = issuerService.subscribeToPendingRequests((requests) => {
            setPendingRequests(requests);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = async (id: string) => {
        if (!backendProfile?.email) return;
        setIsProcessing(id);
        try {
            await issuerService.approveRequest(id, backendProfile.email);
            toast({
                title: "Approving Request",
                description: "The credential is being generated and linked.",
            });
        } catch (err) {
            toast({
                title: "Approval Failed",
                description: "An error occurred while approving the request.",
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
                description: `Request ${id} has been denied.`,
            });
        } catch (err) {
            toast({
                title: "Rejection Failed",
                description: "An error occurred while rejecting the request.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleManualIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!backendProfile?.email) return;

        try {
            await issuerService.issueCredential(formData, backendProfile.email);
            toast({
                title: "Credential Issued",
                description: "New ZKP-Credential has been stored in the global registry.",
            });
            setIsModalOpen(false);
            setFormData({ holderUID: "", credentialType: "", expiryDate: "", notes: "" });
        } catch (err) {
            toast({
                title: "Issuance Failed",
                description: "Could not generate cryptographic signature.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Issue <span className="text-blue-500">Credential</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Manage identity applications and manual issuance
                    </p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black gap-3 h-14 px-10 rounded-2xl shadow-xl uppercase text-[10px] tracking-[0.2em]">
                            <Plus className="w-5 h-5" /> Generate Credential
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic italic">Issue Credential Form</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                Enter holder details to generate a new ZKP-certified credential
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleManualIssue} className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Holder Request ID / UID</Label>
                                    <Input
                                        required
                                        value={formData.holderUID}
                                        onChange={(e) => setFormData({ ...formData, holderUID: e.target.value })}
                                        placeholder="e.g. USER-12345"
                                        className="bg-black/40 border-white/10 rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Credential Type</Label>
                                    <Select
                                        required
                                        onValueChange={(v) => setFormData({ ...formData, credentialType: v })}
                                    >
                                        <SelectTrigger className="bg-black/40 border-white/10 rounded-xl h-12">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                            <SelectItem value="Age Proof">Age Proof</SelectItem>
                                            <SelectItem value="Identity">Identity</SelectItem>
                                            <SelectItem value="Health">Health</SelectItem>
                                            <SelectItem value="Custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Expiry Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="bg-black/40 border-white/10 rounded-xl h-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Notes / Internal Comments</Label>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional issuance details"
                                    className="bg-black/40 border-white/10 rounded-xl h-12"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                                    Authorize & Generate
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-white text-2xl font-black uppercase italic">Pending Requests</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Awaiting verification</CardDescription>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 py-1.5 rounded-full font-black text-xs">
                        {pendingRequests.length} Waiting
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Request ID</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Holder</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Submitted Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                            <p className="mt-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Loading Requests...</p>
                                        </td>
                                    </tr>
                                ) : pendingRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No pending requests</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-6">
                                                <span className="text-[10px] font-mono text-slate-400">#{req.id.substring(0, 8)}...</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-xs">
                                                        {req.holderUID?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-black tracking-tight">{req.holderUID}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified Identity</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xs text-slate-300 font-medium">
                                                    {req.submittedAt?.toDate?.()?.toLocaleDateString() || "Today"}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <Badge className="bg-amber-500/10 text-amber-500 border-none uppercase text-[9px] font-black tracking-widest">Pending</Badge>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {req.documentUrls && req.documentUrls.length > 0 && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-xl">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-xl font-black italic uppercase italic uppercase">Document Verification Preview</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="mt-6 aspect-video w-full bg-black/40 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center">
                                                                    {req.documentUrls[0].endsWith('.pdf') ? (
                                                                        <iframe src={req.documentUrls[0]} className="w-full h-full" />
                                                                    ) : (
                                                                        <img src={req.documentUrls[0]} alt="Document Scan" className="max-w-full max-h-full object-contain" />
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReject(req.id)}
                                                        className="text-rose-500 hover:text-white hover:bg-rose-500 font-black uppercase text-[10px] tracking-widest rounded-xl px-4"
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(req.id)}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl px-6 shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Approve
                                                    </Button>
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
        </div>
    );
}
