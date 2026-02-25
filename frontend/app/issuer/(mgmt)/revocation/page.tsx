"use client";

import { useState } from "react";
import { issuerService } from "@/lib/issuer-service";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ShieldAlert, Search, Trash2,
    AlertTriangle, History, Loader2,
    CheckCircle2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function RevocationPage() {
    const { toast } = useToast();
    const { backendProfile } = useAuth();
    const [credId, setCredId] = useState("");
    const [isRevoking, setIsRevoking] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleRevoke = async () => {
        if (!backendProfile?.email || !credId) return;
        setIsRevoking(true);
        try {
            await issuerService.revokeCredential(credId, backendProfile.email);
            toast({
                title: "Credential Revoked",
                description: "The registry has been updated and the credential is now invalid.",
            });
            setCredId("");
            setConfirming(false);
        } catch (err) {
            toast({
                title: "Revocation Failed",
                description: "Could not find credential ID or permission denied.",
                variant: "destructive"
            });
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Revocation <span className="text-rose-500">Manager</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Invalidate compromised or expired credentials instantly
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Search & Revoke Card */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-rose-500/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-2xl font-black uppercase italic">Authority Revocation</CardTitle>
                                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Permanent Registry Invalidation</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Credential ID (UUID)</Label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={credId}
                                        onChange={e => setCredId(e.target.value)}
                                        placeholder="Enter full credential ID to target..."
                                        className="pl-12 bg-black/40 border-white/10 rounded-2xl h-14 text-white font-mono text-sm"
                                    />
                                </div>
                                <Button
                                    onClick={() => setConfirming(true)}
                                    disabled={!credId || isRevoking}
                                    className="h-14 px-8 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20 gap-3"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Revoke Access
                                </Button>
                            </div>
                        </div>

                        {confirming && (
                            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-4">
                                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="text-rose-500 font-black uppercase text-sm italic">Critical Confirmation Required</h4>
                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                                            This will permanently add this credential to the global revocation list. This action CANNOT be undone. All future verifications for this credential will fail.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirming(false)}
                                        className="text-slate-400 hover:text-white font-black uppercase text-[10px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleRevoke}
                                        disabled={isRevoking}
                                        className="bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-[10px] px-8 rounded-xl"
                                    >
                                        {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Revocation"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-black uppercase text-sm tracking-widest">Audit Trail</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
                            All revocations are logged with your authority email, timestamp, and IP address for compliance and forensic tracking.
                        </p>
                    </Card>

                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-black uppercase text-sm tracking-widest">Global Sync</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
                            Revocation lists are broadcasted across the network in real-time, ensuring verifiers reject the credential within milliseconds.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
