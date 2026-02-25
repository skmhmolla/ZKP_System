/**
 * components/AuthGuard.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Generic auth guard — require Firebase authentication.
 * If not logged in → redirectTo (default: "/").
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
    /** Redirect destination when unauthenticated (default: /) */
    redirectTo?: string;
}

export default function AuthGuard({
    children,
    redirectTo = "/",
}: AuthGuardProps) {
    const { authStatus, authReady } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authReady && authStatus === "unauthenticated") {
            router.replace(redirectTo);
        }
    }, [authStatus, router, redirectTo, authReady]);

    // While auth is loading
    if (!authReady || authStatus === "loading") {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <ShieldCheck className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-white font-black uppercase text-xs tracking-[0.3em] italic">Verifying Session</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Validating credentials...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (authStatus === "unauthenticated") {
        return null; // Redirecting...
    }

    return <>{children}</>;
}
