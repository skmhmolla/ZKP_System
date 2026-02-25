"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { holderService } from "@/lib/holder-service";
import {
    UserPlus, FileText, CheckCircle2, Loader2, Search,
    Clock, ShieldCheck, X, PartyPopper
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

export default function IdentityRequestPage() {
    const { backendProfile } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [requests, setRequests] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successDialog, setSuccessDialog] = useState(false);
    const [submittedRequestId, setSubmittedRequestId] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        dob: "",
        mobile: "",
        email: "",
        address: "",
        idType: "Passport",
        documentId: "",
    });

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const unsubscribe = holderService.subscribeToRequests(backendProfile.firebase_uid, setRequests);
        return () => unsubscribe();
    }, [backendProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!backendProfile?.firebase_uid) {
            console.error("Submission blocked: No Firebase UID found");
            return;
        }

        setIsSubmitting(true);
        try {
            console.log("Transmitting identity request to ZKP Registry...");
            const reqId = await holderService.submitRequest(backendProfile.firebase_uid, formData);
            console.log("Success! Request ID:", reqId);

            setSubmittedRequestId(reqId);
            setSuccessDialog(true);

            setFormData({
                fullName: "", dob: "", mobile: "",
                email: "", address: "", idType: "Passport",
                documentId: ""
            });

            setTimeout(() => {
                router.push("/wallet/dashboard");
            }, 3000);

        } catch (err: any) {
            console.error("Identity transmission failed:", err);
            toast({
                title: "Transmission Failed",
                description: err.message || "Failed to sync with the Decentralized Registry.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "bg-white/5 border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:bg-white/10 transition-all";

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 px-2">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">
                        Identity <span className="text-emerald-500">Request</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Submit your attributes to the Decentralized Registry
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* --- APPLICATION FORM --- */}
                <Card className="lg:col-span-8 bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-emerald-500/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-2xl font-black uppercase italic">New Application</CardTitle>
                                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Global Identity Standard (GIS-1) • Text-Only Protocol</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Full Name (Per ID)</Label>
                                    <Input id="fullName" value={formData.fullName} onChange={handleChange} required className={inputClasses} placeholder="Enter your full legal name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                                    <Input id="dob" type="date" value={formData.dob} onChange={handleChange} required className={inputClasses} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Official Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required className={inputClasses} placeholder="email@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Mobile Access</Label>
                                    <Input id="mobile" value={formData.mobile} onChange={handleChange} required className={inputClasses} placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Residential Address</Label>
                                <Input id="address" value={formData.address} onChange={handleChange} required className={inputClasses} placeholder="Primary street address, City, Country" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Document Type</Label>
                                    <Select value={formData.idType} onValueChange={(v) => setFormData({ ...formData, idType: v })}>
                                        <SelectTrigger className={inputClasses}>
                                            <SelectValue placeholder="Select ID Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                                            <SelectItem value="Passport">Passport</SelectItem>
                                            <SelectItem value="Driving License">Driving License</SelectItem>
                                            <SelectItem value="Student ID">Student ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="documentId" className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Document Serial ID</Label>
                                    <Input id="documentId" value={formData.documentId} onChange={handleChange} required className={inputClasses} placeholder="Enter ID number" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Transmitting Request...</span>
                                    </div>
                                ) : "Authorize & Sign Application"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* --- TRACKING SIDEBAR --- */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-slate-900 border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-6 border-b border-white/5">
                            <CardTitle className="text-white text-md font-black uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4 text-emerald-500" /> Active Registry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {requests.length === 0 ? (
                                <div className="py-10 text-center space-y-3">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed px-4">
                                        No active applications found in the global registry.
                                    </p>
                                </div>
                            ) : (
                                requests.map((req) => (
                                    <div key={req.id} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-emerald-500/20 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[9px] font-mono text-emerald-500 leading-none mb-1 uppercase tracking-tighter">
                                                    {req.requestId || `ID: ${req.id.substring(0, 8)}`}
                                                </p>
                                                <p className="text-xs font-black text-white uppercase italic">{req.documentType || req.idType}</p>
                                            </div>
                                            <div className={cn(
                                                "uppercase text-[8px] font-black px-2 py-0.5 rounded shadow-sm",
                                                req.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                                                    req.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                                        "bg-rose-500/10 text-rose-500"
                                            )}>
                                                {req.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-500 text-[9px] font-bold">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {req.createdAt ? new Date(req.createdAt.toDate ? req.createdAt.toDate() : req.createdAt).toLocaleDateString() : "Just now"}
                                            </div>
                                            {req.status === "approved" && (
                                                <span className="text-emerald-500 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8">
                        <div className="flex gap-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                            <div className="space-y-1">
                                <h3 className="text-emerald-500 font-black uppercase text-xs tracking-widest">Authority Notice</h3>
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic uppercase tracking-wider">
                                    Applications are permanently stored in the Decentralized Identity Registry. This protocol uses text-only attribute verification.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Success Success Dialog */}
            <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
                <DialogContent className="bg-slate-900 border-emerald-500/20 text-white rounded-[3rem] p-12 text-center max-w-lg">
                    <DialogHeader>
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                            <PartyPopper className="w-12 h-12 text-emerald-500" />
                        </div>
                        <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-emerald-500">Submitted!</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] leading-relaxed">
                            Request Submitted Successfully
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-10 p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking ID</p>
                        <p className="text-2xl font-mono text-white font-black">{submittedRequestId}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Redirecting to Dashboard...</p>
                        </div>
                        <Button
                            onClick={() => router.push("/wallet/dashboard")}
                            className="w-full h-14 bg-white text-emerald-900 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-50"
                        >
                            Go Now
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
