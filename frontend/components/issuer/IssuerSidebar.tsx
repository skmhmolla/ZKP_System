"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, PlusCircle, FileText, Activity,
    BarChart3, Key, Download, Settings, ShieldCheck,
    LogOut, ChevronRight, Slash, ShieldAlert, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useIssuerProfile } from "@/context/IssuerContext";

const menuItems = [
    { name: "Dashboard", href: "/issuer/dashboard", icon: LayoutDashboard },
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
    const { issuerProfile } = useIssuerProfile();

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-slate-950 border-r border-white/5 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-8 pb-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-black text-xl tracking-tighter">PrivaSeal</span>
                        <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase opacity-80 italic truncate max-w-[140px]">
                            {issuerProfile.organizationName}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Management Console</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/10 shadow-lg shadow-blue-500/5 translate-x-1"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                <span className="text-[12px] font-bold tracking-tight uppercase tracking-wider">{item.name}</span>
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                />
                            )}
                            {isActive && <ChevronRight className="w-3 h-3 text-blue-400 opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Section */}
            <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-white font-black text-xs">
                            {issuerProfile.adminName.substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-[11px] font-black truncate uppercase tracking-wider">{issuerProfile.adminName}</p>
                        <p className="text-slate-500 text-[9px] truncate font-mono uppercase opacity-70">Issuer Certified</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-xl bg-rose-500/5 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/10 transition-all text-[11px] font-black uppercase tracking-widest"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Terminate Session
                </button>
            </div>
        </aside>
    );
}
