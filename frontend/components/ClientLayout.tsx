"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * ClientLayout
 * ─────────────────────────────────────────────────────────
 * Root client wrapper. All pages are rendered directly.
 * Authentication / role protection is handled at the 
 * individual page or layout level (RoleGuard, landing page
 * auto-redirect), NOT globally here.
 *
 * The old Navbar from components/Navbar.tsx is no longer
 * injected here — each portal page uses its own
 * components/landing/Navbar.tsx.
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
    // All auth/routing logic is delegated to page-level guards.
    // This component is intentionally minimal.
    return <>{children}</>;
}
