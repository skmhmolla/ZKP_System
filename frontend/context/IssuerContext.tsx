"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { issuerService } from "@/lib/issuer-service";
import { getFirebaseFirestore } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface IssuerProfile {
    organizationName: string;
    adminName: string;
    adminEmail: string;
    issuerDID: string;
    nodeDescription: string;
}

interface IssuerContextValue {
    issuerProfile: IssuerProfile;
    updateIssuerProfile: (data: Partial<IssuerProfile>) => void;
    isLoading: boolean;
}

const defaultProfile: IssuerProfile = {
    organizationName: "PrivaSeal Authority",
    adminName: "System Administrator",
    adminEmail: "admin@privaseal.com",
    issuerDID: "did:privaseal:issuer:0x8821...XP91",
    nodeDescription: "Official cryptographic node for issuing ZK-Credentials."
};

const IssuerContext = createContext<IssuerContextValue>({
    issuerProfile: defaultProfile,
    updateIssuerProfile: () => { },
    isLoading: true
});

export function IssuerProvider({ children }: { children: React.ReactNode }) {
    const [issuerProfile, setIssuerProfile] = useState<IssuerProfile>(defaultProfile);
    const [isLoading, setIsLoading] = useState(true);

    // ── LOAD SETTINGS ON APP START ──────────────────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const settings = await issuerService.getSettings();
                if (settings) {
                    setIssuerProfile(settings as IssuerProfile);
                } else {
                    // Initialize with default if not present
                    await issuerService.saveSettings(defaultProfile, "system");
                }
            } catch (e) {
                console.error("Failed to load issuer profile from Firestore:", e);
                // Fallback to local
                const saved = localStorage.getItem("issuerProfile");
                if (saved) setIssuerProfile(JSON.parse(saved));
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();

        // Subscribe to changes for real-time updates across tabs/sessions
        const db = getFirebaseFirestore();
        const unsubscribe = onSnapshot(doc(db, "issuer_settings", "primary_issuer"), (doc) => {
            if (doc.exists()) {
                setIssuerProfile(doc.data() as IssuerProfile);
            }
        });

        return () => unsubscribe();
    }, []);

    // ── SAVE SETTINGS HANDLER ───────────────────────────────────────────────
    const updateIssuerProfile = useCallback(async (data: Partial<IssuerProfile>) => {
        setIssuerProfile(prev => {
            const updated = { ...prev, ...data };
            // Background save to Firestore
            issuerService.saveSettings(updated, updated.adminEmail || "admin")
                .catch(err => console.error("Firestore sync failed:", err));
            // Keep localStorage as fallback
            localStorage.setItem("issuerProfile", JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <IssuerContext.Provider value={{ issuerProfile, updateIssuerProfile, isLoading }}>
            {children}
        </IssuerContext.Provider>
    );
}

export function useIssuerProfile() {
    return useContext(IssuerContext);
}
