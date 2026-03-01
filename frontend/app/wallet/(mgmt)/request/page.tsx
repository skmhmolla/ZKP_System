"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Loader2 } from "lucide-react";

export default function IdentityRequestPage() {
    const { backendProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successId, setSuccessId] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        dob: "",
        email: "",
        mobile: "",
        village: "",
        po: "",
        ps: "",
        city: "",
        district: "",
        state: "",
        pin: "",
        landmark: "",
        documentType: "Aadhaar",
        documentNumber: ""
    });

    // Removed file states and handlers

    const handleFormChange = (k: string, v: string) => {
        let finalValue = v;
        if (k === 'documentNumber' && form.documentType === 'Aadhaar') {
            finalValue = finalValue.replace(/\D/g, '').substring(0, 12);
            finalValue = finalValue.replace(/(\d{4})/g, '$1 ').trim();
        }
        if (k === 'mobile') {
            finalValue = finalValue.replace(/\D/g, '').substring(0, 10);
        }
        setForm(prev => ({ ...prev, [k]: finalValue }));
    };

    const validateForm = () => {
        if (form.mobile.length !== 10) return "Mobile must be 10 digits.";
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(form.email)) return "Invalid email format.";

        if (form.documentType === "Aadhaar" && form.documentNumber.replace(/\s/g, '').length !== 12) return "Aadhaar must be 12 digits.";
        if (form.documentType === "Voter ID" && !/^[A-Za-z0-9]{10}$/.test(form.documentNumber)) return "Voter ID must be 10 alphanumeric characters.";
        if (form.documentType === "Driving License" && form.documentNumber.length > 20) return "Driving License max 20 characters.";

        return null; // Removed generic file missing constraint
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError); return;
        }

        if (!backendProfile?.firebase_uid) {
            setError("You must be logged in."); return;
        }

        setLoading(true);
        try {
            // Replaced FormData payload with standard Form Object (Text Only implementation)
            const data = await api.holder.submitRequest(backendProfile.firebase_uid, form as any);
            setSuccessId(data.data.requestId);
        } catch (err: any) {
            setError(err.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (successId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-900 rounded-2xl p-8 border border-emerald-500/20 shadow-2xl space-y-6 text-center">
                <FileCheck className="w-20 h-20 text-emerald-500" />
                <h2 className="text-3xl text-white font-black italic">REQUEST SUBMITTED</h2>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Your Tracking ID</p>
                <div className="bg-slate-950 px-8 py-4 rounded-xl border border-white/10 text-emerald-400 font-mono text-2xl tracking-widest">
                    {successId}
                </div>
                <Button onClick={() => router.push('/wallet/dashboard')} className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase rounded-xl">
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    const inputClasses = "bg-slate-950 border-white/10 text-white rounded-xl h-12";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl text-white font-black tracking-tighter italic uppercase">Identity <span className="text-emerald-500">Request</span></h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Provide official details to generate your decentralized credential</p>
            </div>

            {error && <div className="p-4 bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-xl text-sm font-black text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/60 p-8 rounded-3xl border border-white/5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Full Name</label>
                        <Input required className={inputClasses} value={form.name} onChange={e => handleFormChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date of Birth</label>
                        <Input type="date" required className={inputClasses} value={form.dob} onChange={e => handleFormChange('dob', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Address</label>
                        <Input type="email" required className={inputClasses} value={form.email} onChange={e => handleFormChange('email', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mobile Number</label>
                        <Input required className={inputClasses} value={form.mobile} onChange={e => handleFormChange('mobile', e.target.value)} placeholder="10 Digits" />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-lg text-white font-black italic uppercase tracking-widest mb-4">Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            ['Village', 'village'], ['Post Office (PO)', 'po'], ['Police Station (PS)', 'ps'],
                            ['City', 'city'], ['District', 'district'], ['State', 'state'],
                            ['PIN Code', 'pin'], ['Landmark', 'landmark']
                        ].map(([label, key]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
                                <Input required className={inputClasses} value={(form as any)[key]} onChange={e => handleFormChange(key, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-lg text-white font-black italic uppercase tracking-widest mb-4">Verification Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Document Type</label>
                            <Select onValueChange={(v) => handleFormChange('documentType', v)} value={form.documentType}>
                                <SelectTrigger className={inputClasses}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                                    <SelectItem value="Driving License">Driving License</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Document Number</label>
                            <Input required className={inputClasses} value={form.documentNumber} onChange={e => handleFormChange('documentNumber', e.target.value)} />
                        </div>
                    </div>
                    {/* File Dropzones Completely Removed for Text-Only */}
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 bg-white text-emerald-950 font-black tracking-widest uppercase rounded-2xl hover:bg-emerald-50">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Identity Request"}
                </Button>
            </form>
        </div>
    );
}
