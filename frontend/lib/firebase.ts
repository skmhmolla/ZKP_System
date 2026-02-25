/**
 * lib/firebase.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Firebase initialisation — exported as lazy singletons so they are safe
 * in Next.js SSR environments (only materialise on the client).
 *
 * Exports:
 *   auth            — Firebase Auth instance
 *   googleProvider  — Google OAuth provider (pre-configured)
 *   getFirebaseAuth()
 *   getGoogleProvider()
 *   getFirebaseApp()
 */
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";


// ── Config from environment variables ─────────────────────────────────────────
const firebaseConfig = {
    apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").trim(),
    authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
    projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
    storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
    messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
    appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "").trim(),
    measurementId: (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "").trim(),
};

// ── Lazy singletons ────────────────────────────────────────────────────────────
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _analytics: Analytics | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseApp(): FirebaseApp {
    if (!_app) {
        if (!firebaseConfig.apiKey) {
            console.warn("⚠️ Firebase API Key is missing. Check .env.local");
        }
        _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        console.log("🔥 Firebase Initialized:", firebaseConfig.projectId);
    }
    return _app;
}

export function getFirebaseAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
        if (typeof window !== "undefined") {
            // Persist session across page reloads
            setPersistence(_auth, browserLocalPersistence).catch((err) => {
                console.warn("Could not set auth persistence:", err);
            });
        }
    }
    return _auth;
}

export function getFirebaseFirestore(): Firestore {
    if (!_db) {
        _db = getFirestore(getFirebaseApp());
    }
    return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (!_storage) {
        _storage = getStorage(getFirebaseApp());
    }
    return _storage;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
    if (typeof window !== "undefined" && !_analytics) {
        const supported = await isSupported();
        if (supported) {
            _analytics = getAnalytics(getFirebaseApp());
        }
    }
    return _analytics;
}


export function getGoogleProvider(): GoogleAuthProvider {
    if (!_googleProvider) {
        _googleProvider = new GoogleAuthProvider();
        _googleProvider.addScope("email");
        _googleProvider.addScope("profile");
        _googleProvider.setCustomParameters({ prompt: "select_account" });
    }
    return _googleProvider;
}

// ── Convenience named exports (matches user's requested structure) ─────────────
// These are NOT instantiated at module import time — they evaluate lazily.
// Usage: import { auth, googleProvider } from "@/lib/firebase"
// NOTE: Only use inside components/hooks (client-side), not in server components.

/**
 * @deprecated Prefer getFirebaseAuth() for SSR safety.
 * For client components, this convenience export is fine.
 */
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (null as unknown as Auth);

/**
 * @deprecated Prefer getGoogleProvider() for SSR safety.
 */
export const googleProvider = typeof window !== "undefined"
    ? getGoogleProvider()
    : (null as unknown as GoogleAuthProvider);

export default getFirebaseAuth;
