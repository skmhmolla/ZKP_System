"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Shield,
    QrCode,
    History,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    Search,
    Bell,
    Settings,
    Activity,
    LogOut,
    Menu,
    X,
    LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifierDashboard() {
    const params = useParams();
    const router = useRouter();
    const { backendProfile, logout } = useAuth();
    const verifierId = params.verifierId as string;

    const [stats, setStats] = useState({
        totalRequests: 0,
        verified: 0,
        failed: 0,
        pending: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.verifier.getStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/verifier/login");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-primary">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-gray-900 tracking-tight">PrivaSeal</span>
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">Verifier Portal</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-500">
                        <a href="#" className="text-blue-600">Dashboard</a>
                        <a href={`/verifier/${verifierId}/history`} className="hover:text-gray-900">Reports</a>
                        <a href="#" className="hover:text-gray-900">Settings</a>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-gray-100"></div>
                        <div className="flex items-center space-x-3 bg-gray-50 pr-4 pl-1 py-1 rounded-full border border-gray-100">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                                {backendProfile?.org_name?.charAt(0) || "V"}
                            </div>
                            <span className="text-xs font-bold text-gray-700 hidden sm:block truncate max-w-[120px]">
                                {backendProfile?.org_name || "Verifier Organization"}
                            </span>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-10 pt-16">
                {/* Welcome & Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-4">
                            Welcome back, <br />
                            <span className="text-blue-600">{backendProfile?.org_name || "Verifier Admin"}</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-lg">
                            Monitor verification requests and manage privacy-first credential checks in real-time.
                        </p>
                    </div>

                    <div className="mt-8 md:mt-0 flex space-x-4">
                        <button
                            onClick={() => router.push(`/verifier/${verifierId}/history`)}
                            className="px-6 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 flex items-center shadow-sm transition-all"
                        >
                            <History className="w-5 h-5 mr-3 text-gray-400" />
                            View History
                        </button>
                        <button
                            onClick={() => router.push(`/verifier/${verifierId}/request`)}
                            className="px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex items-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <QrCode className="w-5 h-5 mr-3" />
                            New Request
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Requests"
                        value={stats.totalRequests}
                        icon={<Activity className="text-blue-600" />}
                        color="blue"
                        loading={loading}
                    />
                    <StatCard
                        title="Successfully Verified"
                        value={stats.verified}
                        icon={<CheckCircle2 className="text-green-600" />}
                        color="green"
                        loading={loading}
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${stats.successRate}%`}
                        icon={<TrendingUp className="text-indigo-600" />}
                        color="indigo"
                        loading={loading}
                    />
                    <StatCard
                        title="Pending Claims"
                        value={stats.pending}
                        icon={<Clock className="text-amber-600" />}
                        color="amber"
                        loading={loading}
                    />
                </div>

                {/* Dashboard Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <History className="w-5 h-5 mr-3 text-blue-600" />
                                    Live Verification Stream
                                </h3>
                                <button
                                    onClick={() => router.push(`/verifier/${verifierId}/history`)}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center uppercase tracking-wider"
                                >
                                    View Detailed Log
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                </button>
                            </div>

                            <VerificationStream verifierId={verifierId} />
                        </div>
                    </div>

                    {/* Side Cards */}
                    <div className="space-y-6">
                        <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Shield className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">Security Note</h4>
                                <p className="text-sm text-blue-100 opacity-90 leading-relaxed mb-6">
                                    All data processed through the PrivaSeal portal is verified via Zero-Knowledge Proofs.
                                    Revealed attributes are stored temporarily and hashed in the audit logs.
                                </p>
                                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors">
                                    Privacy Policy
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-blue-900/5">
                            <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                Infrastructure
                            </h4>
                            <div className="space-y-4">
                                <StatusRow label="Encryption Engine" status="Online" active />
                                <StatusRow label="BBS+ Signature Verifier" status="Active" active />
                                <StatusRow label="Blockchain Node (Dummy)" status="Syncing" />
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">API KEY (Masked)</div>
                                <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-mono text-gray-500 overflow-hidden truncate">
                                    sk_live_51P8p7S2N9...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color, loading }: { title: string, value: any, icon: any, color: string, loading: boolean }) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        indigo: "bg-indigo-50 text-indigo-600",
        amber: "bg-amber-50 text-amber-600"
    };

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-blue-900/5 transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <div className="w-1 h-8 bg-gray-50 rounded-full"></div>
            </div>
            <div className="text-sm font-semibold text-gray-400 mb-1">{title}</div>
            {loading ? (
                <div className="h-8 w-16 bg-gray-100 rounded-md animate-pulse"></div>
            ) : (
                <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
            )}
        </div>
    );
}

function StatusRow({ label, status, active }: { label: string, status: string, active?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{label}</span>
            <div className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${active ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-green-600' : 'text-amber-600'}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}

function VerificationStream({ verifierId }: { verifierId: string }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.verifier.getStats(); // Just a dummy to get something
                // Fetch actual history instead
                const historyRes = await fetch(`/api/verifier/requests?per_page=5`);
                if (historyRes.ok) {
                    const data = await historyRes.json();
                    setRequests(data.data);
                }
            } catch (err) {
                console.error("Stream fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-400 font-medium text-sm">No live activity detected yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${req.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {req.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-gray-900">{req.predicateLabel}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.id.split('-')[0]} • {new Date(req.createdAt).toLocaleTimeString()}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${req.status === 'verified' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                            {req.status}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
