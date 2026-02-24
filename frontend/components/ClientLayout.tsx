"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // The landing page handles its own navbar and doesn't need auth
    const isLanding = pathname === "/";

    // Public routes that should not be behind AuthGuard
    const publicRoutes = [
        "/",
        "/login",
        "/issuer/login",
        "/wallet/login",
        "/verifier/login",
        "/unauthorized",
        "/docs"
    ];

    const isPublic = publicRoutes.includes(pathname);

    if (isLanding) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0f172a,_#020617)] text-slate-200 selection:bg-blue-500/30">

            <Navbar />
            <div className="pt-16 relative z-10">
                {isPublic ? (
                    <>{children}</>
                ) : (
                    <AuthGuard redirectTo="/login">{children}</AuthGuard>
                )}
            </div>
        </div>
    );
}
