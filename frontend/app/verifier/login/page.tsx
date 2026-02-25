"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * /verifier/login — Redirect wrapper.
 *
 * If already authenticated as a verifier → go to dashboard.
 * Otherwise → go to /verifier landing page (where login modal can be opened).
 */
export default function VerifierLoginRedirect() {
    const router = useRouter();
    const { authStatus, backendProfile } = useAuth();

    useEffect(() => {
        if (authStatus === "loading") return;
        if (authStatus === "authenticated" && backendProfile?.role === "verifier") {
            router.replace("/verifier/dashboard");
        } else {
            router.replace("/verifier");
        }
    }, [authStatus, backendProfile, router]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
    );
}
