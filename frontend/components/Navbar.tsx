"use client";

import Link from "next/link";
import { ShieldCheck, UserCircle, Briefcase, ScanLine, BarChart3, Menu, X, Wallet, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Legacy Navbar (components/Navbar.tsx).
 * 
 * This is injected in some inner portal layouts.
 * Portal links now point to landing pages (/issuer, /wallet, /verifier)
 * rather than direct login URLs.
 */
export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, backendProfile, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    let navItems: { name: string; href: string; icon: React.ReactNode }[] = [];

    if (backendProfile?.role === "admin" || backendProfile?.role === "issuer_admin") {
        navItems = [
            { name: "Dashboard", href: "/issuer/dashboard", icon: <Briefcase className="w-4 h-4" /> },
            { name: "Benchmarks", href: "/benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    } else if (backendProfile?.role === "holder_user" || backendProfile?.role === "holder") {
        navItems = [
            { name: "My Wallet", href: "/wallet/dashboard", icon: <Wallet className="w-4 h-4" /> },
            { name: "Benchmarks", href: "/benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    } else if (backendProfile?.role === "verifier") {
        navItems = [
            { name: "Verifier Dashboard", href: "/verifier/dashboard", icon: <ScanLine className="w-4 h-4" /> },
            { name: "Benchmarks", href: "/benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    } else {
        // Unauthenticated — go to portal landing pages, NOT login pages
        navItems = [
            { name: "Issuer Portal", href: "/issuer", icon: <Briefcase className="w-4 h-4" /> },
            { name: "Holder Wallet", href: "/wallet", icon: <Wallet className="w-4 h-4" /> },
            { name: "Verifier Access", href: "/verifier", icon: <ScanLine className="w-4 h-4" /> },
            { name: "Benchmarks", href: "/benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    }

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">PrivaSeal</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                            {currentUser && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-950 border-b border-white/5 px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-in slide-in-from-top duration-200">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${isActive(item.href)
                                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                    {currentUser && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
