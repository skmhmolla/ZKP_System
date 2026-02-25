"use client";

import { IssuerSidebar } from "@/components/issuer/IssuerSidebar";
import RoleGuard from "@/components/RoleGuard";
import { IssuerProvider } from "@/context/IssuerContext";

export default function IssuerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["issuer_admin", "admin"]}>
            <IssuerProvider>
                <div className="flex bg-transparent min-h-screen text-slate-100 font-primary antialiased">
                    <IssuerSidebar />
                    <main className="flex-1 ml-72 overflow-y-auto min-h-screen relative p-4 lg:p-10">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

                        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {children}
                        </div>
                    </main>
                </div>
            </IssuerProvider>
        </RoleGuard>
    );
}
