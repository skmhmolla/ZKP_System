"use client";

import { WalletSidebar } from "@/components/wallet/WalletSidebar";
import RoleGuard from "@/components/RoleGuard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WalletMgmtLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem("walletAuth");
        if (auth !== "true") {
            router.replace("/wallet");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) return null;

    return (
        <RoleGuard allowedRoles={["holder_user"]}>
            <div className="flex bg-[#020617] min-h-screen text-slate-100 font-primary antialiased">
                <WalletSidebar />
                <main className="flex-1 ml-72 overflow-y-auto min-h-screen relative p-4 lg:p-10">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
