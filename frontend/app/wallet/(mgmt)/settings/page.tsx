"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { holderService } from "@/lib/holder-service";
import {
    Settings, Shield, Lock, Bell,
    Smartphone, Database, Trash2,
    RefreshCcw, Eye, EyeOff, CheckCircle2,
    ShieldCheck, Save, Loader2, Key,
    User, Mail, Phone, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { backendProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Privacy Controls
    const [privacySettings, setPrivacySettings] = useState({
        revealNameByDefault: false,
        revealDobByDefault: false,
        shareAgeRangeOnly: true,
        shareEligibilityOnly: true
    });

    // Profile State
    const [profile, setProfile] = useState({
        displayName: "",
        recoveryEmail: "",
        phoneNumber: "",
        backupWallet: "0x" + Math.random().toString(16).substring(2, 42)
    });

    useEffect(() => {
        if (backendProfile) {
            setProfile(p => ({
                ...p,
                displayName: backendProfile.name || "",
                recoveryEmail: backendProfile.email || ""
            }));
        }
    }, [backendProfile]);

    const handleSave = async () => {
        if (!backendProfile?.firebase_uid) return;
        setLoading(true);
        try {
            await holderService.saveSettings(backendProfile.firebase_uid, {
                privacy: privacySettings,
                profile: profile
            });
            await holderService.logActivity(backendProfile.firebase_uid, "SETTINGS_UPDATE", "Updated wallet and privacy configurations");
            toast({ title: "Settings Saved", description: "Your privacy controls have been updated." });
        } catch (err) {
            toast({ title: "Save Failed", description: "Internal error syncing settings.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Wallet <span className="text-emerald-500">Settings</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Configure your privacy-first identity parameters
                    </p>
                </div>

                <Button onClick={handleSave} disabled={loading} className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-500/20 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Commit Changes
                </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* --- PRIVACY CONTROL PANEL --- */}
                <div className="lg:col-span-12">
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/5 bg-emerald-500/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-3xl font-black uppercase italic tracking-tight">Privacy Control Panel</CardTitle>
                                    <CardDescription className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Global Zero-Knowledge defaults for all proof generations</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    id: "revealNameByDefault",
                                    label: "Share Name",
                                    desc: "Reveals your legal name by default in proof presentations.",
                                    icon: User,
                                    val: privacySettings.revealNameByDefault
                                },
                                {
                                    id: "revealDobByDefault",
                                    label: "Share DOB",
                                    desc: "Includes exact birth date in identity requests.",
                                    icon: Phone,
                                    val: privacySettings.revealDobByDefault
                                },
                                {
                                    id: "shareAgeRangeOnly",
                                    label: "Share Age Range Only",
                                    desc: "Only reveal 'Over 18' or 'Over 21' instead of precise age.",
                                    icon: Eye,
                                    val: privacySettings.shareAgeRangeOnly
                                },
                                {
                                    id: "shareEligibilityOnly",
                                    label: "Share Eligibility Only",
                                    desc: "Reveal only 'Qualified' status for credential checks.",
                                    icon: Switch,
                                    val: privacySettings.shareEligibilityOnly
                                }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", item.val ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                                            {item.val ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white font-black text-sm uppercase tracking-tight">{item.label}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider max-w-[200px] leading-relaxed italic">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={item.val}
                                        onCheckedChange={(c) => setPrivacySettings({ ...privacySettings, [item.id]: c })}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* --- PROFILE & SECURITY --- */}
                <div className="lg:col-span-7 space-y-10">
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem]">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-white text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-400" /> Wallet Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Display Name</Label>
                                    <Input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} className="bg-black/40 border-white/10 rounded-2xl h-14" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Recovery Email</Label>
                                    <Input value={profile.recoveryEmail} onChange={(e) => setProfile({ ...profile, recoveryEmail: e.target.value })} className="bg-black/40 border-white/10 rounded-2xl h-14" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Backup Public Key (Read-Only)</Label>
                                <div className="flex gap-4">
                                    <Input value={profile.backupWallet} readOnly className="bg-black/40 border-white/10 rounded-2xl h-14 font-mono text-[10px] text-slate-500" />
                                    <Button variant="outline" className="h-14 w-14 border-white/10 rounded-2xl">
                                        <RefreshCcw className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem]">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-white text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Lock className="w-5 h-5 text-amber-400" /> Security & Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Smartphone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-white font-bold text-xs">Biometric Auto-Lock</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Require FaceID/TouchID on entry</p>
                                    </div>
                                </div>
                                <Switch checked={true} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <RefreshCcw className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-white font-bold text-xs">Automatic Log Logout</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Clear session after 15 minutes of inactivity</p>
                                    </div>
                                </div>
                                <Switch checked={false} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- STORAGE & DANGER --- */}
                <div className="lg:col-span-5 space-y-10">
                    <Card className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-8">
                        <div className="flex gap-6">
                            <Database className="w-10 h-10 text-blue-500 shrink-0" />
                            <div className="space-y-2">
                                <h3 className="text-blue-500 font-black uppercase text-sm tracking-widest">Data Management</h3>
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider italic">
                                    Your certificates are locally stored using IndexedDB + AES-256 wrapping. We never store copies of your PII on our backend servers.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-6">
                                <Trash2 className="w-10 h-10 text-rose-500 shrink-0" />
                                <div className="space-y-2">
                                    <h3 className="text-rose-500 font-black uppercase text-sm tracking-widest">Danger Zone</h3>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider italic">
                                        Destroying the wallet will permanently remove all keys and credentials. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <Button variant="destructive" className="w-full h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase text-[10px] tracking-widest">
                                Purge Identity Wallet
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { Activity } from "lucide-react";
