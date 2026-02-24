"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { currentUser, backendProfile, loading, authStatus } = useAuth();
    const router = useRouter();
    const [safetyTimeout, setSafetyTimeout] = useState(false);

    useEffect(() => {
        console.log("RoleGuard Auth Check:", {
            email: currentUser?.email,
            role: backendProfile?.role,
            loading,
            authStatus,
            allowed: allowedRoles
        });

        // Safety timeout to prevent infinite loading
        const timer = setTimeout(() => {
            setSafetyTimeout(true);
        }, 3000);

        if (!loading && authStatus !== "loading") {
            if (!currentUser) {
                const loginPaths: Record<string, string> = {
                    admin: "/issuer/login",
                    holder: "/wallet/login",
                    verifier: "/verifier/login"
                };
                const targetPath = loginPaths[allowedRoles[0]] || "/login";
                router.replace(targetPath);
            } else if (backendProfile && !allowedRoles.includes(backendProfile.role)) {
                console.warn("Unauthorized Role:", { role: backendProfile.role, allowed: allowedRoles });
                router.replace("/unauthorized?required=" + allowedRoles[0]);
            }
        }

        return () => clearTimeout(timer);
    }, [currentUser, backendProfile, loading, authStatus, router, allowedRoles]);

    // Step 1: Loading phase (Main Firebase Load)
    if ((loading || authStatus === "loading") && !safetyTimeout) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Protocol Handshake...</p>
                </div>
            </div>
        );
    }

    // Step 5: Final Render Control. If we have a user, show children if authorized OR if we timed out (safety)
    const isAuthorized = currentUser && backendProfile && allowedRoles.includes(backendProfile.role);

    // Fallback if profile is slow but user exists
    const showAnyway = currentUser && safetyTimeout;

    if (isAuthorized || showAnyway) {
        return <div className="relative">{children}</div>;
    }

    // Step 1 & 4: Final fallback (minimal)
    return null;
}
