"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Download,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    SearchX,
    Shield,
    Calendar,
    Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const verifierId = params.verifierId as string;

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: page.toString(),
                    per_page: "10",
                    status: statusFilter,
                    // search: searchTerm (backend currently only searches by name/id)
                });
                const res = await fetch(`/api/verifier/requests?${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequests(data.data);
                    setTotalPages(data.total_pages);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page, statusFilter]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-primary">
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </button>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                            <Shield className="w-10 h-10 text-blue-600 mr-4" />
                            Audit Trail
                        </h1>
                        <p className="text-lg text-gray-500 mt-2">
                            A complete, tamper-evident log of all verification requests and results.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by ID..."
                                className="pl-11 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none w-64 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 shadow-sm text-gray-500 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <FilterButton
                        label="All Activity"
                        active={statusFilter === "all"}
                        onClick={() => setStatusFilter("all")}
                    />
                    <FilterButton
                        label="Verified"
                        active={statusFilter === "verified"}
                        onClick={() => setStatusFilter("verified")}
                        icon={<CheckCircle2 className="w-4 h-4 mr-2" />}
                    />
                    <FilterButton
                        label="Waiting"
                        active={statusFilter === "waiting_proof"}
                        onClick={() => setStatusFilter("waiting_proof")}
                        icon={<Clock className="w-4 h-4 mr-2" />}
                    />
                    <FilterButton
                        label="Failed"
                        active={statusFilter === "failed"}
                        onClick={() => setStatusFilter("failed")}
                        icon={<XCircle className="w-4 h-4 mr-2" />}
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Request ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Predicate</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date/Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Proof Hash</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <TableLoadingSkeleton />
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                        <SearchX className="w-8 h-8 text-gray-200" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                                                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.filter(r => r.id.includes(searchTerm)).map((req, idx) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={req.id}
                                                className="group border-b border-gray-50 hover:bg-blue-50/20 transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                        {req.id}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-gray-900">
                                                    <div className="flex items-center">
                                                        <span className="mr-3">{req.predicateIcon || "🪪"}</span>
                                                        {req.predicateLabel}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-xs font-bold text-gray-900 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-2 text-gray-300" />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                                                        {new Date(req.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <StatusBadge status={req.status} />
                                                </td>
                                                <td className="px-8 py-5">
                                                    {req.proofHash ? (
                                                        <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold border border-gray-200">
                                                            {req.proofHash}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase italic">Not Yet Avail.</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && requests.length > 0 && (
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Page <span className="text-gray-900">{page}</span> of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterButton({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: any }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-6 py-3 rounded-full text-xs font-bold flex items-center transition-all whitespace-nowrap
                ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-100'}
            `}
        >
            {icon}
            {label}
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        verified: { bg: "bg-green-100", text: "text-green-700", label: "Verified", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
        waiting_proof: { bg: "bg-amber-100", text: "text-amber-700", label: "Waiting", icon: <Clock className="w-3 h-3 mr-1" /> },
        verifying: { bg: "bg-blue-100", text: "text-blue-700", label: "Verifying...", icon: <Clock className="w-3 h-3 mr-1 animate-pulse" /> },
        failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed", icon: <XCircle className="w-3 h-3 mr-1" /> },
    };

    const config = configs[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };

    return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text}`}>
            {config.icon}
            {config.label}
        </div>
    );
}

function TableLoadingSkeleton() {
    return (
        <>
            {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="border-b border-gray-50">
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                    <td className="px-8 py-6"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div></td>
                    <td className="px-8 py-6"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div></td>
                    <td className="px-8 py-6"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div></td>
                    <td className="px-8 py-6"><div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div></td>
                </tr>
            ))}
        </>
    );
}
