"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import {
    Users, ShieldCheck, Activity,
    FileText, CheckCircle, XCircle, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function IssuerDashboard() {
    const { backendProfile } = useAuth();

    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingApprovals: 0,
        issuedCredentials: 0,
        totalVerifiers: 0
    });

    const [requests, setRequests] = useState<any[]>([]);
    const [verifiers, setVerifiers] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const loadData = async () => {
        if (!backendProfile?.firebase_uid) return;
        const uid = backendProfile.firebase_uid;
        try {
            const [stRes, reqRes, verifRes, audRes] = await Promise.all([
                api.issuer.getStats(uid),
                api.issuer.pendingRequests(uid),
                api.issuer.getPendingVerifiers(uid),
                api.issuer.getAuditLogs(uid)
            ]);
            setStats(stRes.data);
            setRequests(reqRes.data);
            setVerifiers(verifRes.data);
            setAuditLogs(audRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        loadData();
        // optionally poll data or just refetch on action
    }, [backendProfile]);

    const handleApproveRequest = async (id: string) => {
        if (!backendProfile?.firebase_uid) return;
        await api.issuer.approve(backendProfile.firebase_uid, id);
        setIsDialogOpen(false);
        loadData();
    };

    const handleRejectRequest = async (id: string) => {
        if (!backendProfile?.firebase_uid) return;
        await api.issuer.reject(backendProfile.firebase_uid, id);
        setIsDialogOpen(false);
        loadData();
    };

    const handleApproveVerifier = async (vid: string) => {
        if (!backendProfile?.firebase_uid) return;
        await api.issuer.approveVerifier(backendProfile.firebase_uid, vid);
        loadData();
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Authority <span className="text-emerald-500">Dashboard</span></h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Live digital identity issuance overview</p>
            </div>

            {/* LIVE DATA CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Requests", val: stats.totalRequests, icon: FileText, color: "text-blue-500" },
                    { title: "Pending Approvals", val: stats.pendingApprovals, icon: Activity, color: "text-amber-500" },
                    { title: "Issued Credentials", val: stats.issuedCredentials, icon: ShieldCheck, color: "text-emerald-500" },
                    { title: "Total Verifiers", val: stats.totalVerifiers, icon: Users, color: "text-purple-500" }
                ].map((c, i) => (
                    <Card key={i} className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden relative group hover:border-emerald-500/20 transition-colors shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <c.icon className="w-24 h-24" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 border border-white/10 ${c.color}`}>
                                <c.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{c.title}</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{c.val}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
                <TabsList className="bg-slate-900 border-white/5 h-12 inline-flex rounded-xl p-1 shadow-inner">
                    <TabsTrigger value="requests" className="px-6 rounded-lg uppercase text-[10px] tracking-widest font-black data-[state=active]:bg-emerald-500 data-[state=active]:text-black">Identity Requests</TabsTrigger>
                    <TabsTrigger value="verifiers" className="px-6 rounded-lg uppercase text-[10px] tracking-widest font-black data-[state=active]:bg-purple-500 data-[state=active]:text-white">Verifier Control</TabsTrigger>
                    <TabsTrigger value="audit" className="px-6 rounded-lg uppercase text-[10px] tracking-widest font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">Audit Logs</TabsTrigger>
                </TabsList>

                {/* Identity Requests */}
                <TabsContent value="requests">
                    <Card className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Pending Holder Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-black/20 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <th className="p-4 pl-6">Request ID</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">DOB</th>
                                        <th className="p-4">Document Type</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {requests.length === 0 && <tr><td colSpan={6} className="text-center p-8 text-slate-500 text-xs font-black uppercase tracking-widest">No pending requests</td></tr>}
                                    {requests.map(req => (
                                        <tr key={req.requestId} className="hover:bg-white/[0.02] text-sm text-slate-300">
                                            <td className="p-4 pl-6 font-mono text-emerald-400 text-xs">{req.requestId}</td>
                                            <td className="p-4 font-bold">{req.name}</td>
                                            <td className="p-4 text-slate-400">{req.dob}</td>
                                            <td className="p-4"><Badge variant="outline" className="border-white/10">{req.documentType}</Badge></td>
                                            <td className="p-4"><Badge className="bg-amber-500/20 text-amber-500 border-none uppercase text-[8px] font-black">{req.status}</Badge></td>
                                            <td className="p-4 text-right pr-6">
                                                <Dialog open={isDialogOpen && selectedRequest?.requestId === req.requestId} onOpenChange={(val) => {
                                                    setIsDialogOpen(val);
                                                    if (val) setSelectedRequest(req);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="h-8 hover:bg-white/10 hover:text-white text-xs uppercase font-black tracking-widest text-slate-500">View Details</Button>
                                                    </DialogTrigger>
                                                    {selectedRequest && <DialogContent className="bg-slate-900 border-white/10 max-w-4xl rounded-3xl text-white max-h-[85vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl font-black italic uppercase text-white">Review Request</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid grid-cols-2 gap-8 py-4">
                                                            <div className="space-y-4">
                                                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Request ID:</span> <span className="font-mono text-emerald-400">{selectedRequest.requestId}</span></p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Name:</span> {selectedRequest.name}</p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">DOB:</span> {selectedRequest.dob}</p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Email:</span> {selectedRequest.email}</p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Mobile:</span> {selectedRequest.mobile}</p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Address:</span> {`${selectedRequest.village}, ${selectedRequest.city}, ${selectedRequest.state} - ${selectedRequest.pin}`}</p>
                                                                </div>
                                                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Document Type:</span> <Badge>{selectedRequest.documentType}</Badge></p>
                                                                    <p><span className="text-slate-500 font-bold w-32 inline-block">Document No:</span> <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white tracking-widest">{selectedRequest.documentNumber}</span></p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500">Uploaded Media</h4>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold text-slate-400">Front Image</p>
                                                                    {selectedRequest.frontImagePath ? <img src={`${BASE_URL}${selectedRequest.frontImagePath}`} className="w-full h-32 object-cover rounded-xl border border-white/10" alt="Front" /> : <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-xs text-slate-600">No Image</div>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold text-slate-400">Back Image</p>
                                                                    {selectedRequest.backImagePath ? <img src={`${BASE_URL}${selectedRequest.backImagePath}`} className="w-full h-32 object-cover rounded-xl border border-white/10" alt="Back" /> : <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-xs text-slate-600">No Image</div>}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold text-slate-400">Selfie</p>
                                                                    {selectedRequest.selfieImagePath ? <img src={`${BASE_URL}${selectedRequest.selfieImagePath}`} className="w-full h-40 object-cover rounded-xl border border-white/10" alt="Selfie" /> : <div className="w-full h-40 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-xs text-slate-600">No Image</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-4 mt-6">
                                                            <Button variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-500/10 uppercase tracking-widest font-black text-[10px] w-32" onClick={() => handleRejectRequest(selectedRequest.requestId)}>Reject</Button>
                                                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black uppercase tracking-widest font-black text-[10px] w-40" onClick={() => handleApproveRequest(selectedRequest.requestId)}>Approve & Issue ZKP</Button>
                                                        </div>
                                                    </DialogContent>}
                                                </Dialog>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Verifier Control */}
                <TabsContent value="verifiers">
                    <Card className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Pending Verifier Registrations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-black/20 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <th className="p-4 pl-6">Verifier DID</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Registered At</th>
                                        <th className="p-4 text-right pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {verifiers.length === 0 && <tr><td colSpan={4} className="text-center p-8 text-slate-500 text-xs font-black uppercase tracking-widest">No pending verifiers</td></tr>}
                                    {verifiers.map(v => (
                                        <tr key={v.firebaseUID} className="hover:bg-white/[0.02] text-sm text-slate-300">
                                            <td className="p-4 pl-6 font-mono text-purple-400 text-xs">did:privaseal:{v.firebaseUID.substring(0, 16)}</td>
                                            <td className="p-4 font-bold">{v.email}</td>
                                            <td className="p-4 text-slate-400">{new Date(v.createdAt).toLocaleString()}</td>
                                            <td className="p-4 text-right pr-6">
                                                <Button className="bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white h-8 text-[10px] uppercase font-black tracking-widest" onClick={() => handleApproveVerifier(v.firebaseUID)}>Approve</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audit Logs */}
                <TabsContent value="audit">
                    <Card className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-sm font-black text-white uppercase tracking-widest">System Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-black/20 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <th className="p-4 pl-6">Time</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Details</th>
                                        <th className="p-4 text-right pr-6">Target ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {auditLogs.length === 0 && <tr><td colSpan={4} className="text-center p-8 text-slate-500 text-xs font-black uppercase tracking-widest">No audit logs</td></tr>}
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] text-sm text-slate-300">
                                            <td className="p-4 pl-6 text-slate-400 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="p-4">
                                                <Badge variant="outline" className={`border-none text-[8px] uppercase font-black ${log.action.includes('APPROVED') ? 'bg-emerald-500/10 text-emerald-400' :
                                                        log.action.includes('REJECTED') || log.action.includes('FAILED') ? 'bg-rose-500/10 text-rose-400' :
                                                            'bg-slate-500/10 text-slate-400'
                                                    }`}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-slate-300 text-xs">{log.message}</td>
                                            <td className="p-4 text-right pr-6 font-mono text-emerald-500/50 text-[10px]">{log.targetId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

        </div>
    );
}
