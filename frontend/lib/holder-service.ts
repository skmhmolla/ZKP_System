import { getFirebaseFirestore, getFirebaseStorage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    collection, addDoc, query, where, onSnapshot,
    serverTimestamp, doc, updateDoc, getDocs,
    orderBy, limit, getDoc, setDoc
} from "firebase/firestore";

const db = getFirebaseFirestore();

export const HOLDER_COLLECTIONS = {
    REQUESTS: "verification_requests",
    CREDENTIALS: "holder_credentials",
    PROOFS: "zk_proofs",
    ACTIVITY: "wallet_activity",
    SETTINGS: "holder_settings"
};

export const holderService = {
    // 0️⃣ File Uploads
    uploadFile: async (uid: string, file: File, type: string): Promise<string> => {
        const storage = getFirebaseStorage();
        const filename = `${Date.now()}_${file.name}`;
        const fileRef = ref(storage, `walletDocuments/${uid}/${filename}`);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
    },

    // 1️⃣ Identity Requests
    submitRequest: async (uid: string, data: any) => {
        const requestId = "REQ-" + Date.now();
        await addDoc(collection(db, "verification_requests"), {
            requestId,
            uid,
            userUID: uid,
            name: data.fullName || data.name || "",
            dob: data.dob || "",
            email: data.email || "",
            mobile: data.mobile || data.phone || "",
            address: data.address || "",
            documentType: data.idType || data.documentType || "",
            documentNumber: data.documentId || data.documentNumber || "",
            status: "pending",
            createdAt: serverTimestamp(),
            timestamp: serverTimestamp()
        });

        holderService.logActivity(uid, "REQUEST_SUBMITTED", `Submitted identity request: ${requestId}`).catch(() => { });
        return requestId;
    },

    subscribeToRequests: (uid: string, callback: (requests: any[]) => void) => {
        const q = query(
            collection(db, "verification_requests"),
            where("userUID", "==", uid),
            orderBy("timestamp", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(requests);
        });
    },

    // 2️⃣ Credentials
    subscribeToCredentials: (uid: string, callback: (creds: any[]) => void) => {
        const q = query(
            collection(db, HOLDER_COLLECTIONS.CREDENTIALS),
            where("holderUID", "==", uid),
            where("status", "==", "active")
        );
        return onSnapshot(q, (snapshot) => {
            const creds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(creds);
        });
    },

    // 3️⃣ Proof Generation & History
    saveProof: async (uid: string, proofData: any) => {
        await addDoc(collection(db, HOLDER_COLLECTIONS.PROOFS), {
            ...proofData,
            holderUID: uid,
            timestamp: serverTimestamp()
        });

        await holderService.logActivity(uid, "PROOF_GENERATED", `Generated ZK-Proof for ${proofData.purpose}`);
    },

    subscribeToHistory: (uid: string, callback: (history: any[]) => void) => {
        const q = query(
            collection(db, HOLDER_COLLECTIONS.ACTIVITY),
            where("userUID", "==", uid),
            orderBy("timestamp", "desc"),
            limit(20)
        );
        return onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(history);
        });
    },

    subscribeToLatestRequest: (uid: string, callback: (request: any) => void) => {
        const q = query(
            collection(db, "verification_requests"),
            where("userUID", "==", uid),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                callback(null);
            }
        });
    },

    logActivity: async (uid: string, action: string, details: string) => {
        await addDoc(collection(db, HOLDER_COLLECTIONS.ACTIVITY), {
            userUID: uid,
            action,
            details,
            timestamp: serverTimestamp()
        });
    },

    // 4️⃣ Settings
    getSettings: async (uid: string) => {
        const docRef = doc(db, HOLDER_COLLECTIONS.SETTINGS, uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    saveSettings: async (uid: string, settings: any) => {
        const docRef = doc(db, HOLDER_COLLECTIONS.SETTINGS, uid);
        await setDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp()
        }, { merge: true });
    },

    // 5️⃣ Stats Calculations
    getStats: (uid: string, callback: (stats: any) => void) => {
        const credsQ = query(collection(db, HOLDER_COLLECTIONS.CREDENTIALS), where("holderUID", "==", uid), where("status", "==", "active"));
        const activityQ = query(collection(db, HOLDER_COLLECTIONS.ACTIVITY), where("userUID", "==", uid));

        return onSnapshot(activityQ, (activitySnap) => {
            getDocs(credsQ).then(credsSnap => {
                const stats = {
                    credentialsCount: credsSnap.size,
                    activityCount: activitySnap.size,
                    lastActivity: activitySnap.docs[0]?.data()?.timestamp,
                    verificationCount: activitySnap.docs.filter(d => d.data().action === "PROOF_GENERATED").length
                };
                callback(stats);
            });
        });
    }
};
