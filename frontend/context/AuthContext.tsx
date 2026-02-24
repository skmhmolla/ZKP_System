/**
 * context/AuthContext.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Global Firebase auth state — wraps the whole app in layout.tsx.
 *
 * Exports:
 *   <AuthProvider>      — wrap your layout with this
 *   useAuth()           — hook to read currentUser / loading / authStatus
 */
"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { logoutUser, fetchBackendProfile } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface BackendProfile {
    user_id: string;
    firebase_uid: string;
    name: string;
    email: string;
    docs_uploaded: boolean;
    role: string;
    approved?: boolean;
}

interface AuthContextValue {
    currentUser: User | null;
    backendProfile: BackendProfile | null;
    loading: boolean;
    authStatus: AuthStatus;
    idToken: string | null;          // Firebase JWT for backend calls
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    currentUser: null,
    backendProfile: null,
    loading: true,
    authStatus: "loading",
    idToken: null,
    logout: async () => { },
    refreshProfile: async () => { },
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [idToken, setIdToken] = useState<string | null>(null);

    const refreshProfile = useCallback(async () => {
        if (!currentUser) {
            setBackendProfile(null);
            return;
        }
        try {
            const profile = await fetchBackendProfile(currentUser.uid);
            if (profile) {
                setBackendProfile(profile);
            }
        } catch (error) {
            console.error("Failed to refresh backend profile:", error);
        }
    }, [currentUser]);

    useEffect(() => {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Firebase Auth State Changed:", user?.email);
            setCurrentUser(user);
            if (user) {
                const token = await user.getIdToken();
                setIdToken(token);
                // Fetch backend profile to get the role
                const profile = await fetchBackendProfile(user.uid);
                console.log("Backend Profile Loaded:", profile?.role);
                setBackendProfile(profile);
            } else {
                setIdToken(null);
                setBackendProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        await logoutUser();
        setCurrentUser(null);
        setBackendProfile(null);
        setIdToken(null);
        setLoading(false);
    }, []);

    const authStatus: AuthStatus = loading
        ? "loading"
        : currentUser ? "authenticated" : "unauthenticated";

    const value = useMemo(() => ({
        currentUser,
        backendProfile,
        loading,
        authStatus,
        idToken,
        logout,
        refreshProfile,
    }), [currentUser, backendProfile, loading, authStatus, idToken, logout, refreshProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
