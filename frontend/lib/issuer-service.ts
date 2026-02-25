import {
    getFirebaseFirestore
} from "./firebase";
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    getDocs,
    getDoc,
    serverTimestamp,
    orderBy,
    limit,
    increment,
    setDoc
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const db = getFirebaseFirestore();

export const ISSUER_COLLECTIONS = {
    CREDENTIALS: "holder_credentials",
    REQUESTS: "verification_requests",
    REVOCATIONS: "revocations",
    AUDIT_LOGS: "audit_logs",
    SETTINGS: "issuer_settings",
    BENCHMARKS: "benchmarks"
};

export const issuerService = {
    // 1️⃣ Stats
    subscribeToStats: (callback: (stats: any) => void) => {
        const q = collection(db, ISSUER_COLLECTIONS.CREDENTIALS);
        return onSnapshot(q, async (snapshot) => {
            const allCreds = snapshot.docs.map(doc => doc.data());
            const total = allCreds.length;
            const active = allCreds.filter(c => c.status === "active" || c.status === "Active").length;
            const revoked = allCreds.filter(c => c.status === "revoked" || c.status === "Revoked").length;

            // Get pending requests count
            const qRequests = query(collection(db, "verification_requests"), where("status", "==", "pending"));
            const requestsSnapshot = await getDocs(qRequests);

            callback({
                totalIssued: total,
                activeCredentials: active,
                revokedCredentials: revoked,
                activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
                pendingRequests: requestsSnapshot.size
            });
        });
    },

    // 2️⃣ Pending Requests
    subscribeToPendingRequests: (callback: (requests: any[]) => void) => {
        const q = query(
            collection(db, "verification_requests"),
            where("status", "==", "pending"),
            orderBy("timestamp", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(requests);
        });
    },

    // 3️⃣ Approve Request & Automatically Issue
    approveRequest: async (requestId: string, adminEmail: string) => {
        const reqRef = doc(db, "verification_requests", requestId);
        const reqSnap = await getDoc(reqRef);

        if (!reqSnap.exists()) throw new Error("Request not found");
        const reqData = reqSnap.data();

        // 1. Update Request Status
        await updateDoc(reqRef, {
            status: "approved",
            approvedAt: serverTimestamp(),
            approvedBy: adminEmail
        });

        // 2. Automatically Issue Credential
        await issuerService.issueCredential({
            holderUID: reqData.userUID || reqData.holderUID, // Link back to holder
            credentialType: reqData.idType || "Identity Anchor",
            expiryDate: "2030-12-31", // Default for demo
            formData: reqData
        }, adminEmail);

        await issuerService.logAction("APPROVED_AND_ISSUED", adminEmail, `Approved and issued credential for request ${requestId}`);
    },

    // 4️⃣ Reject Request
    rejectRequest: async (requestId: string, adminEmail: string) => {
        const reqRef = doc(db, "verification_requests", requestId);
        await updateDoc(reqRef, {
            status: "rejected",
            rejectedAt: serverTimestamp(),
            rejectedBy: adminEmail
        });

        await issuerService.logAction("REJECTED", adminEmail, `Rejected request ${requestId}`);
    },

    // 5️⃣ Issue Credential
    issueCredential: async (data: any, adminEmail: string) => {
        const credentialId = uuidv4();
        const zkProofId = Array.from(crypto.getRandomValues(new Uint8Array(20)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const credential = {
            credentialId,
            holderUID: data.holderUID,
            credentialType: data.credentialType,
            status: "active",
            zkProofId: `zkp_${zkProofId}`,
            issuedAt: serverTimestamp(),
            expiryDate: data.expiryDate,
            notes: data.notes || "",
            issuer: "PrivaSeal Authority",
            metadata: data.formData || {}
        };

        await setDoc(doc(db, ISSUER_COLLECTIONS.CREDENTIALS, credentialId), credential);

        // Log it
        await issuerService.logAction("ISSUED", adminEmail, `Issued ${data.credentialType} to ${data.holderUID}`);

        return credentialId;
    },

    // 6️⃣ Revoke Credential
    revokeCredential: async (credentialId: string, adminEmail: string) => {
        const credRef = doc(db, ISSUER_COLLECTIONS.CREDENTIALS, credentialId);
        await updateDoc(credRef, {
            status: "revoked",
            revokedAt: serverTimestamp(),
            revokedBy: adminEmail
        });

        // Add to revocations collection
        await addDoc(collection(db, ISSUER_COLLECTIONS.REVOCATIONS), {
            credentialId,
            revokedAt: serverTimestamp(),
            revokedBy: adminEmail
        });

        await issuerService.logAction("REVOKED", adminEmail, `Revoked credential ${credentialId}`);
    },

    // 7️⃣ Audit Logs
    logAction: async (action: string, adminEmail: string, details: string) => {
        await addDoc(collection(db, ISSUER_COLLECTIONS.AUDIT_LOGS), {
            action,
            adminEmail,
            details,
            timestamp: serverTimestamp()
        });
    },

    subscribeToAuditLogs: (callback: (logs: any[]) => void, limitCount = 50) => {
        const q = query(
            collection(db, ISSUER_COLLECTIONS.AUDIT_LOGS),
            orderBy("timestamp", "desc"),
            limit(limitCount)
        );
        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(logs);
        });
    },

    // 8️⃣ Settings
    getSettings: async () => {
        const docRef = doc(db, ISSUER_COLLECTIONS.SETTINGS, "primary_issuer");
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    saveSettings: async (settings: any, adminEmail: string) => {
        const docRef = doc(db, ISSUER_COLLECTIONS.SETTINGS, "primary_issuer");
        await setDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp(),
            updatedBy: adminEmail
        });
        await issuerService.logAction("SETTINGS_UPDATE", adminEmail, "Updated issuer settings");
    },

    // 9️⃣ Issued Credentials List
    subscribeToIssuedCredentials: (callback: (creds: any[]) => void) => {
        const q = query(
            collection(db, ISSUER_COLLECTIONS.CREDENTIALS),
            orderBy("issuedAt", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            const creds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(creds);
        });
    },

    // 10️⃣ Benchmarks
    saveBenchmark: async (results: any) => {
        await addDoc(collection(db, ISSUER_COLLECTIONS.BENCHMARKS), {
            ...results,
            timestamp: serverTimestamp()
        });
    }
};
