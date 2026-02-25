"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnauthorizedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requiredRole = searchParams.get("required");

    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[480px] w-full z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden text-center group">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

                    <div className="mb-10 relative">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20 group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert className="w-12 h-12 text-rose-500" />
                        </div>
                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full opacity-20" />
                    </div>

                    <h1 className="text-5xl font-black text-white mb-4 italic tracking-tighter uppercase leading-none">
                        Unauthorized <br />
                        <span className="text-rose-500">Access</span>
                    </h1>

                    <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4">
                        Your current account does not have permission to access this portal.
                        {requiredRole && (
                            <span className="block mt-4 text-rose-400 font-black uppercase text-[10px] tracking-[0.4em] bg-rose-500/5 py-2 rounded-xl border border-rose-500/10">
                                Required Role: {requiredRole}
                            </span>
                        )}
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => router.push("/")}
                            className="w-full h-16 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Return to Home
                        </Button>

                        <div className="pt-8 flex justify-center items-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                            <Lock className="w-4 h-4" />
                            Node Isolation Active
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    );
}
