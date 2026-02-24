"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requiredRole = searchParams.get("required");

    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6 bg-noise">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <ShieldX className="w-12 h-12 text-red-400" />
                    </div>

                    <h1 className="text-4xl font-black text-white mb-4 italic tracking-tighter">ACCESS DENIED</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        You do not have the necessary permissions to access this portal.
                        {requiredRole && (
                            <span className="block mt-2 text-red-400/80 font-bold uppercase text-xs tracking-widest">
                                Required Role: {requiredRole}
                            </span>
                        )}
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => router.push("/")}
                            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 font-bold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Return Home
                        </Button>

                        <div className="pt-6 flex justify-center items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Lock className="w-3 h-3" /> Encrypted Session Security
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
