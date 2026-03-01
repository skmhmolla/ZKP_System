"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanFace, CheckCircle, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifierDashboard() {
    const { backendProfile, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalScans: 0, totalValid: 0 });

    useEffect(() => {
        if (!backendProfile?.firebase_uid) return;
        const load = async () => {
            try {
                const res = await api.verifier.getDashboardInfo(backendProfile.firebase_uid);
                setStats(res.data);
            } catch (err: any) {
                if (err.message === 'Verifier not approved by Issuer' || err.message.includes('not authorized')) {
                    console.warn("Account is pending approval from the Issuer.");
                }
            }
        };
        load();
    }, [backendProfile]);

    return (
        <div className="max-w-4xl mx-auto space-y-10 pt-10 px-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Verifier <span className="text-emerald-500">Dashboard</span></h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Check Identity Credentials Securely</p>
                </div>
                <Button onClick={logout} variant="ghost" className="text-slate-500 hover:text-white hover:bg-white/10 text-xs font-black tracking-widest uppercase">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </div>

            {!backendProfile ? (
                <div className="flex justify-center p-20 opacity-50"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : !backendProfile.approved ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-10 text-center space-y-4">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ScanFace className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Pending Approval</h2>
                    <p className="text-amber-400 text-sm font-medium pb-4">
                        Your verifier registration was successful. Please wait for the Issuer to review and approve your organization before accessing the verification portal.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                                <ScanFace className="w-40 h-40 text-white" />
                            </div>
                            <CardContent className="p-0 space-y-2 relative z-10">
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Scans Performed</p>
                                <h2 className="text-5xl font-black text-white tracking-tighter">{stats.totalScans}</h2>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-40 h-40 text-white" />
                            </div>
                            <CardContent className="p-0 space-y-2 relative z-10">
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Valid Verifications</p>
                                <h2 className="text-5xl font-black text-emerald-400 tracking-tighter">{stats.totalValid}</h2>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-center mt-12">
                        <Link href="/verifier/verify">
                            <Button className="h-20 px-20 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-black uppercase tracking-widest rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <ScanFace className="w-6 h-6 mr-4" /> Go to Verification Scanner
                            </Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
