"use client";

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
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
    const [camError, setCamError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const isScanningRef = useRef(false);

    useEffect(() => {
        let controls: any = null;
        const reader = new BrowserMultiFormatReader();

        if (mode === "scan") {
            setCamError("");
            isScanningRef.current = true;

            // Allow a tiny delay for the video element to mount completely
            setTimeout(() => {
                if (!videoRef.current) return;
                reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err, ctrl) => {
                    controls = ctrl;
                    if (result && isScanningRef.current) {
                        // Prevent rapid re-scanning
                        isScanningRef.current = false;
                        handleVerify(result.getText());
                    }
                }).catch((err) => {
                    console.error("Camera Access Error:", err);
                    setCamError("Camera access denied or unavailable. This feature requires HTTPS or Localhost.");
                });
            }, 100);
        }

        return () => {
            isScanningRef.current = false;
            if (controls) {
                try { controls.stop(); } catch (e) { }
            }
        };
    }, [mode]);

    const handleVerify = async (idToVerify: string) => {
        if (!backendProfile?.firebase_uid || !idToVerify) return;
        setLoading(true);
        setIsVerifying(true);
        setResult(null);

        // QR data logic handling, if the payload is privaseal:cred:PS-CRED-1234:UID
        let parsedId = idToVerify.trim();
        if (parsedId.includes('privaseal:cred:')) {
            const parts = parsedId.split(':');
            if (parts.length >= 3) {
                parsedId = parts[2].trim(); // extract PS-CRED-XXXX
            }
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
            setIsVerifying(false);
            // Re-enable scanner if they want to scan another one immediately
            setTimeout(() => {
                isScanningRef.current = true;
            }, 3000);
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
                    <div className="flex flex-col items-center justify-center space-y-6 border border-white/5 rounded-3xl bg-black/20 p-6 overflow-hidden relative min-h-[400px]">
                        {camError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-rose-500/10 text-center space-y-4">
                                <XCircle className="w-12 h-12 text-rose-500" />
                                <p className="text-rose-400 font-bold uppercase tracking-widest text-xs leading-relaxed">{camError}</p>
                            </div>
                        ) : (
                            <>
                                <Scan className="absolute text-emerald-500/10 w-[300px] h-[300px] pointer-events-none" />
                                <div className="w-full max-w-[300px] aspect-square rounded-[2rem] overflow-hidden border-2 border-emerald-500/50 relative shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                    {isVerifying ? (
                                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                                            <p className="text-white font-black uppercase tracking-widest text-[10px]">Processing Proof...</p>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-[2rem] animate-pulse pointer-events-none" />
                                    )}
                                </div>
                                <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase text-center max-w-xs leading-relaxed">
                                    Point camera directly at the Holder's PrivaSeal QR code.
                                </p>
                            </>
                        )}

                        <div className="w-full pt-4 border-t border-white/5 relative z-10">
                            <Input
                                placeholder="Or Paste QR Payload here..."
                                className="bg-slate-950 border-white/10 text-white rounded-xl w-full text-center font-mono text-xs opacity-50 focus:opacity-100"
                                onChange={(e) => {
                                    if (e.target.value) handleVerify(e.target.value);
                                    e.target.value = '';
                                }}
                            />
                        </div>
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
