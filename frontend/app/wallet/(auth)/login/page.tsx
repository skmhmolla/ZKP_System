"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PortalAuthModal } from "@/components/auth/PortalAuthModal";

export default function WalletLoginPage() {
    const router = useRouter();
    const { authStatus, backendProfile } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (authStatus === "authenticated" && backendProfile?.role === "holder_user") {
            router.replace("/wallet/dashboard");
        }
    }, [authStatus, backendProfile, router]);

    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Wallet <span className="text-emerald-500">Login</span></h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Enter your secure identity enclave</p>
                </div>

                <PortalAuthModal
                    isOpen={true}
                    onClose={() => router.push("/wallet")}
                    mode="wallet"
                    initialTab="login"
                    inline={true}
                />
            </div>
        </div>
    );
}
