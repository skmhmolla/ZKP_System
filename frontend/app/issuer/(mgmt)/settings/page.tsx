"use client";

import { useState, useEffect } from "react";
import { useIssuerProfile } from "@/context/IssuerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Building2, User, Mail, Globe,
    FileText, Save, RefreshCcw,
    CheckCircle2, Loader2, Shield
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const { toast } = useToast();
    const { issuerProfile, updateIssuerProfile, isLoading } = useIssuerProfile();
    const [formData, setFormData] = useState(issuerProfile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(issuerProfile);
    }, [issuerProfile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateIssuerProfile(formData);
            toast({
                title: "Settings Saved",
                description: "Node profile synchronized with Firestore registry.",
            });
        } catch (err) {
            toast({
                title: "Save Failed",
                description: "An error occurred while updating settings.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Fetching Node Configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Node <span className="text-blue-500">Settings</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Configure your authority's public profile and node identity
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-2xl font-black uppercase italic">Organization Profile</CardTitle>
                                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Public identity on the ZKP Network</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Organization Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={formData.organizationName}
                                        onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                                        className="pl-12 bg-black/40 border-white/10 rounded-2xl h-14 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Issuer DID</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={formData.issuerDID}
                                        readOnly
                                        className="pl-12 bg-black/20 border-white/5 rounded-2xl h-14 text-slate-400 font-mono text-xs cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Admin Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={formData.adminName}
                                        onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                        className="pl-12 bg-black/40 border-white/10 rounded-2xl h-14 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Admin Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        value={formData.adminEmail}
                                        onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                        className="pl-12 bg-black/40 border-white/10 rounded-2xl h-14 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Node Status / Description</Label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                <Textarea
                                    value={formData.nodeDescription}
                                    onChange={e => setFormData({ ...formData, nodeDescription: e.target.value })}
                                    className="pl-12 bg-black/40 border-white/10 rounded-2xl min-h-[120px] pt-4 text-white resize-none"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(issuerProfile)}
                        className="h-14 px-8 border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white"
                    >
                        Reset Changes
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 gap-3"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Node Configuration
                    </Button>
                </div>
            </form>

            <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-3xl p-8">
                <div className="flex gap-4">
                    <Shield className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                        <h3 className="text-emerald-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                            Authority Verification <CheckCircle2 className="w-4 h-4" />
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic mt-1">
                            Your organization identity is currently verified on the global root authority list. Changes to your organization name or email may trigger a re-verification process.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
