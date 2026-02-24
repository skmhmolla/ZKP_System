"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { X, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

import { useWalletStore } from "@/stores/useWalletStore";
import { type Credential } from "@/lib/db";

export default function QRScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const addCredential = useWalletStore((state) => state.addCredential);
    const credentials = useWalletStore((state) => state.credentials);

    const handleScan = useCallback((data: string) => {
        try {
            // Some scanners might return just the content, others might wrap it.
            // We expect a URL starting with privaseal://
            let urlObj: URL;
            try {
                urlObj = new URL(data);
            } catch {
                // Not a valid URL
                throw new Error("Not a valid PrivaSeal code");
            }

            if (urlObj.protocol !== "privaseal:") {
                throw new Error("Invalid protocol. Must be privaseal://");
            }

            if (urlObj.pathname.includes("credential") || urlObj.host === "credential") {
                // Handle Credential Import
                const payload = urlObj.searchParams.get("payload");
                if (!payload) throw new Error("No payload found");

                const credential = JSON.parse(payload);
                // Simple validation
                if (!credential.type || !credential.iss || !credential.sig) {
                    throw new Error("Invalid credential format");
                }

                // Map payload to Credential interface
                const newCredential: Credential = {
                    id: credential.id,
                    issuerPublicKey: credential.pk,
                    signature: credential.sig,
                    attributes: credential.data || {},
                    issuedAt: new Date().toISOString(),
                    issuer: credential.iss,
                    metadata: {
                        issuerName: credential.iss,
                        credentialType: credential.type
                    }
                };

                // Avoid duplicates
                const exists = credentials.some(c => c.id === newCredential.id);

                if (!exists) {
                    addCredential(newCredential);
                    toast({ title: "Success", description: `Added ${credential.type} credential` });
                } else {
                    toast({ title: "Info", description: "Credential already exists" });
                }

                router.push("/wallet");
            } else if (urlObj.pathname.includes("verify") || urlObj.host === "verify") {
                // Handle Verification Request
                const reqId = urlObj.searchParams.get("req");
                if (!reqId) throw new Error("No request ID found");

                router.push(`/wallet/prove?req=${reqId}`);
            } else {
                throw new Error("Unknown PrivaSeal action");
            }

        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            toast({ title: "Invalid Code", description: message, variant: "destructive" });
            // Small delay before rescanning to avoid alert loop
            setTimeout(() => setScanning(true), 1500);
        }
    }, [router, toast]);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let controls: IScannerControls | null = null;

        if (scanning && videoRef.current) {
            codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error, scannerControls) => {
                if (result) {
                    handleScan(result.getText());
                    scannerControls.stop();
                    setScanning(false);
                }
            }).then((c) => {
                controls = c;
            }).catch((err) => {
                console.error("Error accessing camera:", err);
            });
        }

        return () => {
            if (controls) {
                controls.stop();
            }
        };
    }, [scanning, handleScan]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => router.back()}
            >
                <X className="w-8 h-8" />
            </Button>

            <div className="relative w-full max-w-sm aspect-square border-2 border-white/50 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-primary animate-pulse m-8 rounded-lg pointer-events-none"></div>
            </div>

            <div className="flex flex-col gap-4 w-full px-8 mt-8">
                <p className="text-white text-center text-sm">
                    Point your camera at a PrivaSeal QR Code to import a credential or verify a request.
                </p>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-white/40">Or</span>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={async () => {
                        try {
                            const text = await navigator.clipboard.readText();
                            handleScan(text);
                        } catch {
                            toast({ title: "Clipboard Error", description: "Could not read from clipboard", variant: "destructive" });
                        }
                    }}
                >
                    <Copy className="w-4 h-4" />
                    Paste Code from Clipboard
                </Button>
                <p className="text-[10px] text-white/40 text-center">Useful for testing if you can&apos;t scan screens</p>
            </div>
        </div>
    );
}
