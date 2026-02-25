"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

/**
 * RoleGuard — Protects dashboard routes.
 *
 * Behavior:
 * - While auth is loading → show spinner
 * - If NOT logged in → redirect to the portal landing page (NOT login page)
 * - If logged in but wrong role → show Access Denied
 * - If authorized → render children
 *
 * Role aliases handled:
 *   "issuer" or "issuer_admin" or "admin" → Issuer dashboard
 *   "holder" or "holder_user"             → Wallet dashboard
 *   "verifier"                             → Verifier dashboard
 */
export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { currentUser, role, authStatus, authReady } = useAuth();
    const router = useRouter();

    // Normalize role — handle legacy role names
    const normalizeRole = (r: string | null): string => {
        if (!r) return "";
        if (r === "admin" || r === "issuer") return "issuer_admin";
        if (r === "holder") return "holder_user";
        return r;
    };

    // Expand allowedRoles to include all aliases
    const expandAllowedRoles = (roles: string[]): string[] => {
        const expanded = new Set<string>(roles);
        if (roles.some(r => ["issuer", "issuer_admin", "admin"].includes(r))) {
            expanded.add("issuer_admin");
            expanded.add("issuer");
            expanded.add("admin");
        }
        if (roles.some(r => ["holder", "holder_user"].includes(r))) {
            expanded.add("holder_user");
            expanded.add("holder");
        }
        return Array.from(expanded);
    };

    // Determine portal landing page for redirect
    const getPortalPath = () => {
        const firstRole = allowedRoles[0] || "";
        if (["issuer", "issuer_admin", "admin"].includes(firstRole)) return "/issuer";
        if (["holder", "holder_user"].includes(firstRole)) return "/wallet";
        if (firstRole === "verifier") return "/verifier";
        return "/";
    };

    useEffect(() => {
        if (!authReady) return;
        if (authStatus === "unauthenticated") {
            router.replace(getPortalPath());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady, authStatus]);

    // ── 1. Auth initializing ──────────────────────────────────────────────────
    if (!authReady || authStatus === "loading") {
        return <AuthLoadingScreen message="Verifying access permissions..." />;
    }

    // ── 2. Not logged in → redirecting ────────────────────────────────────────
    if (authStatus === "unauthenticated") {
        return <AuthLoadingScreen message="Redirecting..." />;
    }

    // ── 3. Logged in — waiting for role to resolve ────────────────────────────
    if (currentUser && !role) {
        return <AuthLoadingScreen message="Loading your profile..." />;
    }

    // ── 4. Check authorization ────────────────────────────────────────────────
    const normalizedUserRole = normalizeRole(role);
    const expandedAllowed = expandAllowedRoles(allowedRoles);
    const isAuthorized = expandedAllowed.includes(normalizedUserRole);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
                        <ShieldAlert className="w-10 h-10 text-rose-500" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-rose-500 text-2xl font-black italic uppercase tracking-tight">
                            Access Denied
                        </h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Your account <span className="text-white font-bold">({normalizedUserRole || "unknown role"})</span> does
                            not have permission to access this portal.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => router.replace(getPortalPath())}
                            className="bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs px-8 rounded-xl h-12 border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Portal
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}
                            className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                        >
                            Sign Out & Switch Account
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── 5. Authorized ─────────────────────────────────────────────────────────
    return <div className="animate-in fade-in duration-300">{children}</div>;
}

// ── Loading screen ─────────────────────────────────────────────────────────────
function AuthLoadingScreen({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <Loader2 className="w-6 h-6 text-blue-400/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{message}</p>
            </div>
        </div>
    );
}
