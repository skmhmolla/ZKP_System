/**
 * lib/auth.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * All Firebase auth operations in one place.
 * Every function returns { user, error } — never throws — so callers can
 * display errors without try/catch clutter.
 *
 * Roles:
 *   issuer      → Issuer Authority (predefined admin email only)
 *   holder_user → Holder Wallet (any registered user)
 *   verifier    → Verifier Organization
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    User,
    UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getGoogleProvider, getFirebaseFirestore } from "./firebase";
import { ADMIN_EMAILS } from "@/config/admin";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AuthResult {
    user: User | null;
    error: string | null;
}

export type UserRole = "issuer_admin" | "holder_user" | "verifier";

// ── Firestore: save user role ──────────────────────────────────────────────────
/**
 * Writes (or updates) the user record in Firestore:
 *   /users/{uid} → { email, role, displayName, createdAt }
 *
 * This is the canonical role source for the frontend.
 */
export async function writeUserToFirestore(
    user: User,
    role: UserRole,
    extraData: Record<string, unknown> = {}
): Promise<void> {
    try {
        const db = getFirebaseFirestore();
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            // Only update non-role fields if user already exists
            // (don't overwrite role on re-login)
            await setDoc(ref, {
                email: user.email || "",
                displayName: user.displayName || "",
                updatedAt: serverTimestamp(),
                ...extraData,
            }, { merge: true });
        } else {
            // New user — write full record
            await setDoc(ref, {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                approved: role === "holder_user" ? false : true,
                ...extraData,
            });
        }
    } catch (e: any) {
        if (!e?.message?.includes("offline")) {
            console.warn("[PrivaSeal] Firestore write failed:", e);
        }
    }
}

/**
 * Reads the user role from Firestore.
 * Falls back to localStorage if Firestore is unavailable.
 */
export async function getUserRoleFromFirestore(uid: string): Promise<UserRole | null> {
    try {
        const db = getFirebaseFirestore();
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
            return snap.data().role as UserRole || null;
        }
        return null;
    } catch {
        return null;
    }
}

// ── Backend Sync ──────────────────────────────────────────────────────────────
/**
 * Syncs user to the Python backend after Firebase auth.
 * Non-fatal — if backend is down, Firestore still holds the role.
 */
// ── Backend Sync ──────────────────────────────────────────────────────────────
/**
 * Syncs user to the Node backend after Firebase auth.
 * Non-fatal — if backend is down, Firestore still holds the role.
 */
export async function syncUserToBackend(
    user: User,
    role: string = "holder", // role mapping update
    extraData: Record<string, unknown> = {}
): Promise<Record<string, unknown> | null> {
    try {
        let mappedRole = role === "issuer_admin" ? "issuer" : role === "holder_user" ? "holder" : role;
        const r = await fetch(`/api/auth/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firebaseUID: user.uid,
                email: user.email || "",
                role: mappedRole
            }),
        });
        const data = await r.json();
        return data.success ? data : null;
    } catch (e) {
        console.warn("[PrivaSeal] Backend sync failed (non-fatal):", e);
        return null;
    }
}

export async function fetchBackendProfile(uid: string): Promise<Record<string, unknown> | null> {
    try {
        const r = await fetch(`/api/auth/me/${uid}`);
        if (!r.ok) return null;
        const data = await r.json();
        return data.success ? data.data : null;
    } catch {
        return null;
    }
}

// ── Email / Password Registration ──────────────────────────────────────────────
export async function signUpWithEmail(
    email: string,
    password: string,
    role: UserRole = "holder_user",
    displayName?: string,
    extraData: Record<string, unknown> = {}
): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
        const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
            await updateProfile(cred.user, { displayName });
        }

        // 1. Write to Firestore (primary role source)
        await writeUserToFirestore(cred.user, role, extraData);

        // 2. Sync to backend (secondary, non-fatal)
        await syncUserToBackend(cred.user, role, extraData);

        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Email / Password Login ─────────────────────────────────────────────────────
export async function loginWithEmail(
    email: string,
    password: string,
): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
        const cred = await signInWithEmailAndPassword(auth, email, password);

        // Sync with backend (updates last_login etc.) — non-blocking
        syncUserToBackend(cred.user).catch(() => { });

        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Google OAuth ───────────────────────────────────────────────────────────────
/**
 * Google sign-in. Role is used only if the user is NEW.
 * Existing users keep their stored Firestore role.
 */
export async function loginWithGoogle(role: UserRole = "holder_user"): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        const provider = getGoogleProvider();
        if (!auth || !provider) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
        const cred = await signInWithPopup(auth, provider);

        // Check if existing user or new
        const existingRole = await getUserRoleFromFirestore(cred.user.uid);

        if (!existingRole) {
            // New user — write role to Firestore
            await writeUserToFirestore(cred.user, role);
        }

        // Always sync to backend
        await syncUserToBackend(cred.user, existingRole || role);

        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
        await signOut(auth);
    }
}

// ── Firebase → human-readable errors ─────────────────────────────────────────
function friendlyError(e: unknown): string {
    const code = (e as { code?: string })?.code || "";
    const map: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/cancelled-popup-request": "Sign-in already in progress.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
        "auth/operation-not-allowed": "This sign-in method is not enabled. Contact administrator.",
        "auth/popup-blocked": "Pop-up was blocked by your browser. Please allow pop-ups.",
    };
    return map[code] || (e instanceof Error ? e.message : "Authentication failed. Please try again.");
}
