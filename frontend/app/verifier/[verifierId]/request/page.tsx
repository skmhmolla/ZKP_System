"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
    Shield,
    ArrowLeft,
    QrCode,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Lock,
    Eye,
    Zap,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Predicate {
    key: string;
    label: string;
    description: string;
    icon: string;
    credential_type: string;
}

export default function VerificationRequestPage() {
    const params = useParams();
    const router = useRouter();
    const { backendProfile } = useAuth();
    const verifierId = params.verifierId as string;

    const [predicates, setPredicates] = useState<Predicate[]>([]);
    const [selectedPredicate, setSelectedPredicate] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [qrData, setQrData] = useState<{ requestId: string; qrCode: string; predicate: string } | null>(null);

    // Fetch available predicates
    useEffect(() => {
        const fetchPredicates = async () => {
            try {
                const res = await fetch("/api/verifier/predicates");
                if (res.ok) {
                    const data = await res.json();
                    setPredicates(data.predicates);
                    if (data.predicates.length > 0) {
                        setSelectedPredicate(data.predicates[0].key);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch predicates", err);
                setError("Failed to load verification types. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPredicates();
    }, []);

    const handleCreateRequest = async () => {
        if (!selectedPredicate) return;

        setCreating(true);
        setError(null);
        try {
            const verifierName = backendProfile?.org_name || backendProfile?.displayName || "Authorized Verifier";
            const data = await api.verifier.createRequest(selectedPredicate, verifierId, verifierName);
            setQrData(data);
        } catch (err: any) {
            setError(err.message || "Failed to create request");
        } finally {
            setCreating(false);
        }
    };

    const resetRequest = () => {
        setQrData(null);
        setError(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading verification options...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 font-primary">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <Shield className="w-10 h-10 text-blue-600 mr-4" />
                        New Verification Request
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                        Define what you need to verify. Users will receive a request to prove this information
                        without revealing their entire identity.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Configuration Form */}
                <div className={`${qrData ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col h-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                            Configure Predicate
                        </h2>

                        <div className="space-y-6 flex-grow">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                                    What are you verifying?
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {predicates.map((pred) => (
                                        <label
                                            key={pred.key}
                                            className={`
                                                relative flex items-center p-4 rounded-2xl cursor-pointer border-2 transition-all
                                                ${selectedPredicate === pred.key
                                                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20'
                                                    : 'border-gray-100 bg-white hover:border-gray-200'}
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="predicate"
                                                value={pred.key}
                                                checked={selectedPredicate === pred.key}
                                                onChange={() => setSelectedPredicate(pred.key)}
                                                className="hidden"
                                            />
                                            <span className="text-2xl mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-50">{pred.icon}</span>
                                            <div>
                                                <div className="font-bold text-gray-900">{pred.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{pred.description}</div>
                                            </div>
                                            {selectedPredicate === pred.key && (
                                                <CheckCircle2 className="w-5 h-5 text-blue-600 absolute right-4" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-start">
                                        <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Privacy Protocol</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                This request uses BBS+ selective disclosure. You will only receive a Boolean result
                                                and the specifically revealed fields.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateRequest}
                            disabled={creating || !selectedPredicate}
                            className={`
                                mt-8 w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all
                                ${creating
                                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]'}
                            `}
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Generating Secure Request...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 mr-3" />
                                    Initiate Verification
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-sm animate-pulse">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: QR Code & Result */}
                <div>
                    <AnimatePresence mode="wait">
                        {!qrData ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl p-12 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-full min-h-[500px] text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                                    <QrCode className="w-12 h-12 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Ready</h3>
                                <p className="text-gray-500 max-w-xs leading-relaxed">
                                    Configure your predicate on the left and click "Initiate" to generate a secure QR code for users to scan.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/10 border border-blue-100 flex flex-col items-center h-full relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 z-0"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full -ml-12 -mb-12 opacity-50 z-0"></div>

                                <div className="relative z-10 w-full text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                            Live Verification Request
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Scan with PrivaSeal Wallet</h3>

                                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 mb-8 inline-block">
                                        <QRCodeSVG
                                            value={qrData.qrCode}
                                            size={220}
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/logo.png",
                                                x: undefined,
                                                y: undefined,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl text-left border border-blue-100/50">
                                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Request Details</div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">{qrData.predicate}</span>
                                                <span className="text-[10px] font-mono text-gray-400">{qrData.requestId.split('-')[0]}...</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={resetRequest}
                                            className="w-full py-4 text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors"
                                        >
                                            Create Another Request
                                        </button>
                                    </div>

                                    <div className="mt-8 flex items-center justify-center space-x-4 text-gray-400">
                                        <div className="flex items-center text-[10px] font-medium">
                                            <Users className="w-3 h-3 mr-1" />
                                            Universal
                                        </div>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <div className="flex items-center text-[10px] font-medium">
                                            <Eye className="w-3 h-3 mr-1" />
                                            Zero-Reveal
                                        </div>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <div className="flex items-center text-[10px] font-medium">
                                            <Lock className="w-3 h-3 mr-1" />
                                            Encrypted
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
