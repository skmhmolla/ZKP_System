"use client";

import { useState } from "react";
import {
    Settings, User, Shield, Bell, Network,
    Palette, Save, Lock, Globe, Database,
    Smartphone, Moon, Sun, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        toast({
            title: "Settings Updated",
            description: "Your issuer node configuration has been saved successfully.",
        });
        setIsSaving(false);
    };

    return (
        <div className="space-y-8 pb-20 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Issuer Settings</h1>
                <p className="text-slate-400 font-medium">Control your node identity, network endpoints, and security policies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Nav */}
                <div className="md:col-span-1 space-y-1">
                    {[
                        { id: "profile", label: "Issuer Profile", icon: User },
                        { id: "network", label: "Node & Network", icon: Network },
                        { id: "security", label: "Security & Auth", icon: Shield },
                        { id: "notifications", label: "Alerts", icon: Bell },
                        { id: "appearance", label: "Interface", icon: Palette },
                    ].map((item, idx) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${idx === 0 ? "bg-blue-600/10 text-blue-400 border border-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-8">
                    {/* Issuer Identity */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg font-bold">Issuer Identity</CardTitle>
                            <CardDescription className="text-slate-500">Public profile details for your credentialing node.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organization Name</Label>
                                    <Input defaultValue="PrivaSeal Authority Node #1" className="bg-slate-950/50 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Issuer ID (Internal)</Label>
                                    <Input defaultValue="PS-NODE-10292" disabled className="bg-slate-900/50 border-white/10 text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contact Email</Label>
                                <Input defaultValue="root@privaseal.io" className="bg-slate-950/50 border-white/10 text-white" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Node Configuration */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg font-bold">Node & Network</CardTitle>
                            <CardDescription className="text-slate-500">Manage how your node interacts with the global registry.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                <div className="space-y-0.5">
                                    <p className="text-white font-bold text-sm">Automated Proof Indexing</p>
                                    <p className="text-[10px] text-slate-500">Sync all issued proofs with global read-only nodes.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Data Storage Region</Label>
                                <Select defaultValue="eu-west">
                                    <SelectTrigger className="bg-slate-950/50 border-white/10 text-white">
                                        <Globe className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
                                        <SelectItem value="eu-west">Europe (Ireland) - Optimized</SelectItem>
                                        <SelectItem value="ap-south">Asia Pacific (Mumbai)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg font-bold">Security & Governance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                            < Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                                            <p className="text-[10px] text-slate-500">Require an OTP for all batch revocations and exports.</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Audit Log Persistence</p>
                                            <p className="text-[10px] text-slate-500">Keep system audit logs for up to 2 years (Compliant).</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-6">
                        <Button variant="ghost" className="text-slate-500 hover:text-white font-bold h-12 px-8 rounded-xl">Discard</Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black h-12 px-8 rounded-xl shadow-xl shadow-blue-500/20"
                        >
                            {isSaving ? "Saving Configuration..." : "Apply Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
