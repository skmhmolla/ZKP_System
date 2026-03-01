"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Keyboard, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
    const { backendProfile } = useAuth();
    const [mode, setMode] = useState<"scan" | "manual">("manual");
    const [credId, setCredId] = useState("");
    const [result, setResult] = useState<"VERIFIED" | "FAILED" | null>(null);
    const [failReason, setFailReason] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (idToVerify: string) => {
        if (!backendProfile?.firebase_uid) return;
        setLoading(true);
        setResult(null);

        // QR data logic handling, if the payload is privaseal:cred:PS-CRED-1234:UID
        let parsedId = idToVerify;
        if (parsedId.includes('privaseal:cred:')) {
            parsedId = parsedId.split(':')[2]; // extract PS-CRED-XXXX
        }

        try {
            const res = await api.verifier.verifyCredential(backendProfile.firebase_uid, parsedId);
            setResult(res.result === 'VERIFIED' ? "VERIFIED" : "FAILED");
            setFailReason(res.result === 'VERIFIED' ? "" : "Invalid or revoked credential.");
        } catch (e: any) {
            setResult("FAILED");
            setFailReason(e.message || "Invalid or revoked credential.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 pt-10 px-4">
            <Link href="/verifier/dashboard">
                <Button variant="ghost" className="text-slate-500 hover:text-white uppercase tracking-widest text-[10px] font-black -ml-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
            </Link>

            <div className="text-center space-y-2">
                <h1 className="text-4xl text-white font-black italic uppercase tracking-tighter">Credential <span className="text-emerald-500">Validation</span></h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select input method for identity proofing</p>
            </div>

            <div className="flex gap-4 justify-center">
                <Button variant={mode === "scan" ? "default" : "outline"} onClick={() => setMode("scan")} className={`uppercase tracking-widest text-[10px] font-black rounded-2xl h-12 px-8 ${mode === 'scan' ? 'bg-emerald-500 text-black border-none' : 'border-white/10 text-white hover:bg-white/5'}`}>
                    <Scan className="w-4 h-4 mr-2" /> Scan QR
                </Button>
                <Button variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")} className={`uppercase tracking-widest text-[10px] font-black rounded-2xl h-12 px-8 ${mode === 'manual' ? 'bg-emerald-500 text-black border-none' : 'border-white/10 text-white hover:bg-white/5'}`}>
                    <Keyboard className="w-4 h-4 mr-2" /> Enter ID manually
                </Button>
            </div>

            <Card className="bg-slate-900 border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                {mode === "manual" ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Credential ID Tracker</label>
                            <Input
                                placeholder="e.g. PS-CRED-123456"
                                className="bg-slate-950 border-white/10 text-white rounded-xl h-14 font-mono text-center tracking-widest"
                                value={credId}
                                onChange={(e) => setCredId(e.target.value)}
                            />
                        </div>
                        <Button disabled={loading || !credId} onClick={() => handleVerify(credId)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black uppercase font-black tracking-widest rounded-2xl h-14">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify Identity"}
                        </Button>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6 border-4 border-dashed border-white/5 rounded-3xl bg-black/20">
                        <Scan className="w-16 h-16 text-emerald-500 animate-pulse" />
                        <p className="text-slate-400 font-bold tracking-widest text-xs uppercase text-center max-w-xs leading-relaxed">
                            Point camera at the Holder's QR code. (Camera integration requires HTTPS/local binding).
                        </p>
                        <Input
                            placeholder="Scan/Paste QR Data Here..."
                            className="bg-slate-950 border-white/10 text-white rounded-xl w-64 text-center font-mono opacity-50 focus:opacity-100"
                            onChange={(e) => {
                                if (e.target.value) handleVerify(e.target.value);
                                e.target.value = '';
                            }}
                        />
                    </div>
                )}
            </Card>

            {result && (
                <div className={`p-8 rounded-[2.5rem] text-center border shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${result === "VERIFIED" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                    }`}>
                    {result === "VERIFIED" ? (
                        <>
                            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-3xl text-emerald-400 font-black italic tracking-tighter uppercase">VERIFIED</h3>
                            <p className="text-emerald-500/60 uppercase font-black text-[10px] tracking-widest mt-2">Credential is active and valid</p>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-20 h-20 text-rose-400 mx-auto mb-4" />
                            <h3 className="text-3xl text-rose-400 font-black italic tracking-tighter uppercase">FAILED</h3>
                            <p className="text-rose-500/60 uppercase font-black text-[10px] tracking-widest mt-2">{failReason}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
