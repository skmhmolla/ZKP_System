"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, PlusCircle, FileText, Activity,
    BarChart3, Key, Download, Settings, ShieldCheck,
    LogOut, ChevronRight, Slash, ShieldAlert, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
    { name: "Dashboard", href: "/issuer", icon: LayoutDashboard },
    { name: "Issue Credential", href: "/issuer/issue", icon: PlusCircle },
    { name: "Issued Credentials", href: "/issuer/issued", icon: FileText },
    { name: "Revocation Manager", href: "/issuer/revocation", icon: ShieldAlert },
    { name: "Audit Logs", href: "/issuer/logs", icon: Activity },
    { name: "Key Management", href: "/issuer/keys", icon: Key },
    { name: "Benchmarks", href: "/benchmarks", icon: Zap },
    { name: "Settings", href: "/issuer/settings", icon: Settings },
];

export function IssuerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, backendProfile } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/issuer/login");
    };

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-slate-950 border-r border-white/5 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-8 pb-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-black text-xl tracking-tighter">PrivaSeal</span>
                        <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase opacity-80">Issuer Node</div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/10 shadow-lg shadow-blue-500/5 rotate-[-1deg] scale-[1.02]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Section */}
            <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                        <span className="text-white font-bold text-xs">IS</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-black truncate uppercase tracking-wider">{backendProfile?.name || "Root Issuer"}</p>
                        <p className="text-slate-500 text-[10px] truncate font-mono">Issuer #10292</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-bold border border-transparent hover:border-red-500/10"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
