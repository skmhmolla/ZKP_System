/**
 * lib/auth.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * All Firebase auth operations in one place.
 * Every function returns { user, error } — never throws — so callers can
 * display errors without try/catch clutter.
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithPhoneNumber,
    signOut,
    RecaptchaVerifier,
    ConfirmationResult,
    updateProfile,
    User,
    UserCredential,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "./firebase";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Result type ────────────────────────────────────────────────────────────────
interface AuthResult {
    user: User | null;
    error: string | null;
}

// ── Helper: create backend user record after first Firebase login ───────────────
export async function syncUserToBackend(user: User, role: string = "holder", extraData: any = {}): Promise<any> {
    try {
        const idToken = await user.getIdToken();
        const r = await fetch(`${BACKEND}/api/privaseal/user/firebase-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firebase_uid: user.uid,
                email: user.email || "",
                display_name: user.displayName || user.phoneNumber || "",
                phone_number: user.phoneNumber || "",
                photo_url: user.photoURL || "",
                provider: user.providerData[0]?.providerId || "unknown",
                id_token: idToken,
                role: role,
                ...extraData
            }),
        });
        const data = await r.json();
        return data.success ? data : null;
    } catch (e) {
        console.warn("[PrivaSeal] Backend user sync failed", e);
        return null;
    }
}

export async function fetchBackendProfile(uid: string): Promise<any> {
    try {
        const r = await fetch(`${BACKEND}/api/privaseal/user/auth/me?uid=${uid}`);
        if (!r.ok) return null;
        const data = await r.json();
        return data.success ? data.profile : null;
    } catch {
        return null;
    }
}

// ── Email / Password ───────────────────────────────────────────────────────────
export async function signUpWithEmail(
    email: string,
    password: string,
    role: string = "holder",
    displayName?: string,
    extraData: any = {}
): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(cred.user, { displayName });
        }
        await syncUserToBackend(cred.user, role, extraData);
        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

export async function loginWithEmail(
    email: string,
    password: string,
): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Sync without overriding role if it exists, or the backend handles it
        await syncUserToBackend(cred.user);
        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Google OAuth ───────────────────────────────────────────────────────────────
export async function loginWithGoogle(role: string = "holder"): Promise<AuthResult> {
    try {
        const auth = getFirebaseAuth();
        const provider = getGoogleProvider();
        const cred = await signInWithPopup(auth, provider);
        await syncUserToBackend(cred.user, role);
        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Phone / OTP ────────────────────────────────────────────────────────────────
let _confirmationResult: ConfirmationResult | null = null;

export async function loginWithPhoneOTP(phoneNumber: string): Promise<{ error: string | null }> {
    try {
        const auth = getFirebaseAuth();
        // Invisible reCAPTCHA — appended to a hidden div
        let container = document.getElementById("recaptcha-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "recaptcha-container";
            container.style.visibility = "hidden";
            document.body.appendChild(container);
        }
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
        _confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        return { error: null };
    } catch (e: unknown) {
        return { error: friendlyError(e) };
    }
}

export async function confirmPhoneOTP(otp: string, role: string = "holder"): Promise<AuthResult> {
    if (!_confirmationResult) {
        return { user: null, error: "OTP session expired. Please request a new code." };
    }
    try {
        const cred = await _confirmationResult.confirm(otp);
        _confirmationResult = null;
        await syncUserToBackend(cred.user, role);
        return { user: cred.user, error: null };
    } catch (e: unknown) {
        return { user: null, error: friendlyError(e) };
    }
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
    const auth = getFirebaseAuth();
    await signOut(auth);
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
        "auth/invalid-phone-number": "Invalid phone number. Use international format: +91XXXXXXXXXX",
        "auth/invalid-verification-code": "Invalid OTP code. Please try again.",
        "auth/code-expired": "OTP has expired. Please request a new one.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
    };
    return map[code] || (e instanceof Error ? e.message : "Authentication failed");
}
