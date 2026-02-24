"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import {
    Plus, ShieldCheck, Loader2, Save, X,
    Calendar, User, FileText, Lock, Tags,
    Layers, AlertCircle, Info, Fingerprint,
    CheckCircle2, Cpu, Hash, ArrowRight,
    Shield, Eye, EyeOff, Layout, Zap,
    Database, Send, Sparkles, Binary
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
    accessLevel: string;
    tags: string[];
    attributes: Record<string, string | number>;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Attribute {
    id: string;
    name: string;
    value: string;
    predicate: string;
    selectiveDisclosure: boolean;
}

export default function IssueCredentialPage() {
    const issueCredential = (data: any) => {
        console.log("Issuing Credential:", data);
    };
    const addAuditLog = (action: string, actor: string, target: string, detail: string) => {
        console.log(`Audit Log: ${action} - ${actor} - ${target} - ${detail}`);
    };
    const { toast } = useToast();

    // Issuance State
    const [isIssuing, setIsIssuing] = useState(false);
    const [issuancePhase, setIssuancePhase] = useState<"idle" | "signing" | "broadcasting" | "delivered">("idle");
    const [signingProgress, setSigningProgress] = useState(0);
    const [generatedHash, setGeneratedHash] = useState("");

    // Form State
    const [holderId, setHolderId] = useState("");
    const [credentialType, setCredentialType] = useState<"Age" | "Identity" | "Membership" | "Vaccination" | "Prescription">("Age");
    const [category, setCategory] = useState<"Standard" | "Enterprise" | "VIP" | "Restricted">("Standard");
    const [expiryDate, setExpiryDate] = useState("");

    const [attributes, setAttributes] = useState<Attribute[]>([
        { id: "1", name: "Full Name", value: "John Doe", predicate: "None", selectiveDisclosure: false },
        { id: "2", name: "Date of Birth", value: "1990-05-15", predicate: ">= 18 years", selectiveDisclosure: true },
        { id: "3", name: "Nationality", value: "United States", predicate: "None", selectiveDisclosure: true }
    ]);

    const addAttribute = () => {
        const newAttr: Attribute = {
            id: Math.random().toString(36).substr(2, 9),
            name: "",
            value: "",
            predicate: "None",
            selectiveDisclosure: true
        };
        setAttributes([...attributes, newAttr]);
    };

    const updateAttribute = (id: string, field: keyof Attribute, value: any) => {
        setAttributes(attributes.map(attr => attr.id === id ? { ...attr, [field]: value } : attr));
    };

    const removeAttribute = (id: string) => {
        setAttributes(attributes.filter(attr => attr.id !== id));
    };

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!holderId.trim()) {
            toast({
                title: "Invalid Holder ID",
                description: "Holder ID is required.",
                variant: "destructive"
            });
            return;
        }

        setIsIssuing(true);
        setIssuancePhase("signing");
        setSigningProgress(0);

        try {
            // Phase 1: Cryptographic Signing (Progress Simulation)
            for (let i = 0; i <= 60; i += 10) {
                setSigningProgress(i);
                await new Promise(r => setTimeout(r, 100));
            }

            // Prepare attributes as Record<string, any>
            const attrMap: Record<string, any> = {};
            attributes.forEach(attr => {
                if (attr.name) attrMap[attr.name.toLowerCase().replace(/\s+/g, '_')] = attr.value;
            });
            attrMap["holder_id"] = holderId;

            // Phase 2: Call Real API
            setIssuancePhase("broadcasting");
            const result = await api.issuer.issueCredential(credentialType.toLowerCase(), attrMap);

            setSigningProgress(100);
            if (result.credential) {
                setGeneratedHash(result.credential.signature || "SIG_UNKNOWN");
            }

            setIssuancePhase("delivered");

            toast({
                title: "ZK-Credential Issued",
                description: "Credential signed and delivered via PrivaSeal Protocol.",
            });
        } catch (err: any) {
            console.error("Issuance failed:", err);
            setIssuancePhase("idle");
            setIsIssuing(false);
            toast({
                title: "Issuance Failed",
                description: err.message || "A network error occurred.",
                variant: "destructive"
            });
        }
    };

    const resetForm = () => {
        setIssuancePhase("idle");
        setIsIssuing(false);
        setHolderId("");
        setGeneratedHash("");
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                        Issue New ZK-Credential
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Generate privacy-preserving attributes with <span className="text-blue-400 font-bold">Selective Disclosure</span> and <span className="text-emerald-400 font-bold">Unlinkable</span> proofs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Badge variant="outline" className="bg-slate-900 border-white/10 text-slate-400 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Binary className="w-3 h-3" /> BBS+ Signature Implementation
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* 1️⃣ HOLDER IDENTIFICATION */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                            <Fingerprint className="w-24 h-24 text-blue-400" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" /> Holder Identification
                            </CardTitle>
                            <CardDescription className="text-slate-500">Connect this credential to a unique PrivaSeal Identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Holder Wallet ID (DID)</label>
                                <Input
                                    required
                                    placeholder="PS-XXXX-XXXX-XXXX"
                                    value={holderId}
                                    onChange={(e) => setHolderId(e.target.value)}
                                    className="bg-slate-950/50 border-white/10 text-white h-12 text-lg font-mono rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <p className="text-[10px] text-slate-600 italic">Example: PS-AX71-B291-K002</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2️⃣ ATTRIBUTES & 3️⃣ PREDICATE BUILDER & 4️⃣ SELECTIVE DISCLOSURE */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-indigo-400" /> Attribute Configuration
                                </CardTitle>
                                <CardDescription className="text-slate-500">Define signed attributes and their disclosure policies.</CardDescription>
                            </div>
                            <Button type="button" onClick={addAttribute} variant="outline" className="border-white/10 text-slate-400 hover:text-white rounded-xl gap-2 font-bold uppercase text-[10px]">
                                <Plus className="w-3 h-3" /> Add Attribute
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {attributes.map((attr, index) => (
                                    <motion.div
                                        key={attr.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 bg-slate-950/50 rounded-2xl border border-white/10 space-y-4 relative group/attr"
                                    >
                                        <button
                                            onClick={() => removeAttribute(attr.id)}
                                            className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover/attr:opacity-100 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Attribute Name</label>
                                                <Input
                                                    value={attr.name}
                                                    onChange={(e) => updateAttribute(attr.id, "name", e.target.value)}
                                                    className="bg-slate-900 border-white/5 h-10 text-sm font-bold"
                                                    placeholder="e.g. Age"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Raw Value</label>
                                                <Input
                                                    value={attr.value}
                                                    onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                                                    className="bg-slate-900 border-white/5 h-10 text-sm font-mono"
                                                    placeholder="e.g. 25"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Supported Predicates</label>
                                                <Select value={attr.predicate} onValueChange={(v) => updateAttribute(attr.id, "predicate", v)}>
                                                    <SelectTrigger className="bg-slate-900 border-white/5 h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                        <SelectItem value="None">Direct Match Only</SelectItem>
                                                        <SelectItem value=">= 18 years">Range Check (Age)</SelectItem>
                                                        <SelectItem value="Contains">Content Match</SelectItem>
                                                        <SelectItem value="MemberOf">Set Membership</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                {attr.selectiveDisclosure ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black">
                                                        <Eye className="w-3 h-3 mr-1" /> Selective Disclosure Enabled
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-black">
                                                        <EyeOff className="w-3 h-3 mr-1" /> Mandatory Attribute
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Allow Selective Proof</span>
                                                <Switch
                                                    checked={attr.selectiveDisclosure}
                                                    onCheckedChange={(checked) => updateAttribute(attr.id, "selectiveDisclosure", checked)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5️⃣ CREDENTIAL METADATA */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Tags className="w-5 h-5 text-purple-400" /> Administrative Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Type</label>
                                <Select value={credentialType} onValueChange={(v: any) => setCredentialType(v)}>
                                    <SelectTrigger className="bg-slate-950/50 border-white/10 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="Age">Age Verification</SelectItem>
                                        <SelectItem value="Identity">National ID</SelectItem>
                                        <SelectItem value="Membership">Institutional Membership</SelectItem>
                                        <SelectItem value="Vaccination">Health Certificate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lifespan (Expiry)</label>
                                <Input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="bg-slate-950/50 border-white/10 h-11"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview & Status (4 cols) */}
                <div className="lg:col-span-4 space-y-8 sticky top-24">
                    {/* 7️⃣ PRIVACY ASSURANCE PANEL */}
                    <Card className="bg-blue-600/5 border-blue-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield className="w-4 h-4" /> ZKP-Privacy Engine
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Unlinkability", icon: Zap, color: "text-amber-400" },
                                { label: "Min. Data Exposure", icon: ShieldCheck, color: "text-emerald-400" },
                                { label: "BBS+ Signatures", icon: Binary, color: "text-indigo-400" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("w-4 h-4", item.color)} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                            ))}
                            <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    "PrivaSeal ensures that the holder can derive range proofs without revealing their master identifier to anyone."
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 8️⃣ CREDENTIAL PREVIEW */}
                    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-white/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20 text-blue-400 animate-pulse" />
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-white text-md font-black uppercase tracking-widest italic">ZK-Passport Preview</CardTitle>
                                <Badge className="bg-blue-600 text-[8px] font-black">DRAFT</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Master DID</span>
                                    <span className="text-xs font-mono text-white truncate">{holderId || "NOT_SET"}</span>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Attribute Signature Root</span>
                                    <div className="space-y-2">
                                        {attributes.slice(0, 3).map((attr, i) => (
                                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-3 h-3 text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-300">{attr.name || "Attribute"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {attr.selectiveDisclosure ? <Eye className="w-3 h-3 text-emerald-500/50" /> : <Lock className="w-3 h-3 text-slate-600" />}
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tabular-nums tracking-tighter shadow-sm font-mono truncate max-w-[60px]">
                                                        {attr.value ? '●●●●●' : 'NONE'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {attributes.length > 3 && (
                                            <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">+ {attributes.length - 3} more attributes</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white/5 border-t border-white/5 flex flex-col gap-3">
                            <AnimatePresence mode="wait">
                                {issuancePhase === "idle" && (
                                    <Button
                                        onClick={handleIssue}
                                        disabled={!holderId || attributes.some(a => !a.name)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-12 rounded-xl transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-[0.2em] gap-3"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Issue ZK Credential
                                    </Button>
                                )}

                                {(issuancePhase === "signing" || issuancePhase === "broadcasting") && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full space-y-4"
                                    >
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
                                            <span>
                                                {issuancePhase === "signing" ? "Generating BBS+ Signature..." : "Anchoring to Network..."}
                                            </span>
                                            <span>{signingProgress}%</span>
                                        </div>
                                        <Progress value={signingProgress} className="h-1.5 bg-slate-900" indicatorClassName="bg-blue-600 shadow-[0_0_10px_#3b82f6]" />
                                    </motion.div>
                                )}

                                {issuancePhase === "delivered" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full space-y-4"
                                    >
                                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                                            <Send className="w-5 h-5 animate-bounce" />
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-widest">Wallet Delivery Complete</p>
                                                <p className="text-[9px] opacity-70">Attribute encrypted & transmitted.</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={resetForm}
                                            variant="outline"
                                            className="w-full border-white/10 text-slate-400 font-black h-12 rounded-xl hover:bg-white/5"
                                        >
                                            Next Issuance
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardFooter>
                    </Card>

                    {/* 6️⃣ CRYPTOGRAPHIC SIGNING VISUALIZATION */}
                    <AnimatePresence>
                        {generatedHash && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-4"
                            >
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    <Hash className="w-4 h-4" /> Final Signature Fingerprint
                                </div>
                                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl font-mono text-[9px] text-emerald-500/80 break-all leading-relaxed relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {generatedHash}
                                </div>
                                <p className="text-[9px] text-slate-600 font-medium italic text-center">
                                    This signature allows multi-attribute proofs without revealing the full dataset.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
