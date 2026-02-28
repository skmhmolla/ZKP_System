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
import { doc, onSnapshot, Unsubscribe, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { logoutUser, fetchBackendProfile, writeUserToFirestore } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/config/admin";

// ── Types ──────────────────────────────────────────────────────────────────────
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface BackendProfile {
    user_id?: string;
    firebase_uid: string;
    name?: string;
    displayName?: string;
    email: string;
    role: string;
    approved?: boolean;
    docs_uploaded?: boolean;
    org_name?: string;
    business_type?: string;
}

interface AuthContextValue {
    currentUser: User | null;
    backendProfile: BackendProfile | null;
    role: string | null;
    loading: boolean;
    authStatus: AuthStatus;
    authReady: boolean;
    nodeReady: boolean;
    idToken: string | null;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    currentUser: null,
    backendProfile: null,
    role: null,
    loading: true,
    authStatus: "loading",
    authReady: false,
    nodeReady: false,
    idToken: null,
    logout: async () => { },
    refreshProfile: async () => { },
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState(false);

    /**
     * Resolve the role for a given Firebase user.
     * Priority: admin email > Firestore > backend > localStorage
     */
    const resolveRole = useCallback(async (user: User): Promise<string> => {
        // 1. Admin whitelist always wins
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            return "issuer_admin";
        }

        // 2. Try Firestore
        try {
            const db = getFirebaseFirestore();
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data()?.role) {
                return userDoc.data().role as string;
            }
        } catch (error) {
            console.warn("[AuthContext] Firestore role check failed:", error);
        }

        // 3. Try backend profile
        try {
            const profile = await fetchBackendProfile(user.uid);
            if (profile?.role) return profile.role as string;
        } catch { }

        // 4. localStorage fallback
        const stored = localStorage.getItem("user_role");
        return stored || "holder_user";
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!currentUser) {
            setBackendProfile(null);
            setRole(null);
            return;
        }
        try {
            const officialRole = await resolveRole(currentUser);
            setRole(officialRole);
            localStorage.setItem("user_role", officialRole);

            const profile: BackendProfile = {
                firebase_uid: currentUser.uid,
                email: currentUser.email || "",
                displayName: currentUser.displayName || "",
                role: officialRole,
            };

            const backendData = await fetchBackendProfile(currentUser.uid);
            if (backendData) {
                setBackendProfile({ ...profile, ...backendData });
            } else {
                setBackendProfile(profile);
            }
        } catch (error) {
            console.error("[AuthContext] refreshProfile error:", error);
        }
    }, [currentUser, resolveRole]);

    // ── Firebase Auth Listener ────────────────────────────────────────────────
    useEffect(() => {
        const auth = getFirebaseAuth();
        let firestoreUnsub: Unsubscribe | null = null;

        // Safety: force-unblock UI after 6s max
        const safetyTimer = setTimeout(() => {
            if (!authReady) {
                setLoading(false);
                setAuthReady(true);
            }
        }, 6000);

        if (!auth) {
            clearTimeout(safetyTimer);
            setLoading(false);
            setAuthReady(true);
            return () => { };
        }

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            clearTimeout(safetyTimer);

            if (firestoreUnsub) {
                firestoreUnsub();
                firestoreUnsub = null;
            }

            if (user) {
                setCurrentUser(user);

                // 1. FAST PATH: Unblock UI using local storage or admin check
                const fastRole = (user.email && ADMIN_EMAILS.includes(user.email))
                    ? "issuer_admin"
                    : localStorage.getItem("user_role") || "holder_user";

                setRole(fastRole);
                setLoading(false);
                setAuthReady(true);

                // 2. SLOW PATH: Background verification
                resolveRole(user).then((officialRole) => {
                    setRole(officialRole);
                    localStorage.setItem("user_role", officialRole);
                });

                user.getIdToken().then(setIdToken).catch(() => setIdToken(null));

                if (user.email && ADMIN_EMAILS.includes(user.email)) {
                    writeUserToFirestore(user, "issuer_admin").catch(() => { });
                }

                const initialProfile: BackendProfile = {
                    firebase_uid: user.uid,
                    email: user.email || "",
                    displayName: user.displayName || "",
                    role: fastRole,
                };

                fetchBackendProfile(user.uid).then((backendData) => {
                    setBackendProfile(prev => ({ ...initialProfile, ...backendData, role: prev?.role || fastRole }));
                }).catch(() => setBackendProfile(initialProfile));

                // 3. LISTEN FOR CHANGES
                try {
                    const db = getFirebaseFirestore();
                    firestoreUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
                        if (snap.exists()) {
                            const data = snap.data();
                            const firestoreRole = (user.email && ADMIN_EMAILS.includes(user.email))
                                ? "issuer_admin"
                                : (data.role as string || fastRole);
                            setRole(firestoreRole);
                            localStorage.setItem("user_role", firestoreRole);
                            setBackendProfile(prev => prev ? { ...prev, role: firestoreRole } : null);
                        }
                    }, () => { });
                } catch { }

            } else {
                // Signed out
                setCurrentUser(null);
                setBackendProfile(null);
                setRole(null);
                setIdToken(null);
                localStorage.removeItem("user_role");
                setLoading(false);
                setAuthReady(true);
            }
        });

        return () => {
            clearTimeout(safetyTimer);
            unsubAuth();
            if (firestoreUnsub) firestoreUnsub();
        };
    }, [authReady, resolveRole]);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
            setCurrentUser(null);
            setBackendProfile(null);
            setRole(null);
            setIdToken(null);
            localStorage.clear();
        } catch (err) {
            console.error("[AuthContext] logout error:", err);
        }
    }, []);

    const authStatus: AuthStatus = loading
        ? "loading"
        : currentUser ? "authenticated" : "unauthenticated";

    const value = useMemo(() => ({
        currentUser,
        backendProfile,
        role,
        loading,
        authStatus,
        idToken,
        logout,
        refreshProfile,
        authReady,
        nodeReady: authReady,
    }), [currentUser, backendProfile, role, loading, authStatus, idToken, logout, refreshProfile, authReady]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
