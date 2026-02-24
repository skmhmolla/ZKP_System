"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, backendProfile, logout, authStatus } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getNavLinks = () => {
        if (!currentUser || !backendProfile) {
            return [
                { name: "Issuer Portal", href: "/issuer/login" },
                { name: "Holder Wallet", href: "/wallet/login" },
                { name: "Verifier Portal", href: "/verifier/login" },
                { name: "Benchmarks", href: "/benchmarks" },
            ];
        }

        const role = backendProfile.role;
        if (role === "admin") {
            return [
                { name: "Issuer Admin", href: "/issuer", icon: ShieldCheck },
                { name: "Benchmarks", href: "/benchmarks" },
            ];
        } else if (role === "holder") {
            return [
                { name: "My Wallet", href: "/wallet", icon: WalletIcon },
                { name: "Benchmarks", href: "/benchmarks" },
            ];
        } else if (role === "verifier") {
            return [
                { name: "Verifier Portal", href: "/verifier", icon: LayoutDashboard },
                { name: "Benchmarks", href: "/benchmarks" },
            ];
        }
        return [];
    };

    const navLinks = getNavLinks();

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
                ? "bg-background/80 backdrop-blur-md border-white/10 py-3"
                : "bg-transparent border-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        PrivaSeal
                    </span>
                </Link>

                {/* Center Navigation (Desktop) */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group flex items-center gap-2"
                        >
                            {link.icon && <link.icon size={16} className="text-blue-400" />}
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Right Area (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    {authStatus === "loading" ? (
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-spin border-2 border-blue-500/30 border-t-blue-500" />
                    ) : currentUser ? (
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-white leading-none capitalize">
                                    {backendProfile?.name || "User"}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">
                                    {backendProfile?.role}
                                </span>
                            </div>
                            <div className="relative group/user">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-white/10 flex items-center justify-center cursor-pointer group-hover/user:border-white/30 transition-all overflow-hidden">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="absolute top-full right-0 mt-3 w-48 py-2 bg-[#0A1120] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all">
                                    <button
                                        onClick={() => logout()}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Button
                            asChild
                            className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg shadow-blue-500/25 px-8 hover:scale-105 transition-all"
                        >
                            <Link href="/wallet/login">Get Started</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#050B18]/95 backdrop-blur-xl border-b border-white/10"
                    >
                        <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-gray-300 hover:text-white flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.icon && <link.icon size={20} className="text-blue-400" />}
                                    {link.name}
                                </Link>
                            ))}
                            {currentUser ? (
                                <button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    className="w-full py-4 text-left text-lg text-red-500 flex items-center gap-3 border-t border-white/5"
                                >
                                    <LogOut size={20} />
                                    Log Out
                                </button>
                            ) : (
                                <Button
                                    asChild
                                    className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-full py-6 text-lg"
                                >
                                    <Link href="/wallet/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        Get Started
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
