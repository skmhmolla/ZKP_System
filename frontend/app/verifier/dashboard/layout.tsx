"use client";

import RoleGuard from "@/components/RoleGuard";

export default function VerifierDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["verifier", "admin"]}>
            <div className="min-h-screen bg-[#050B18]">
                {children}
            </div>
        </RoleGuard>
    );
}
