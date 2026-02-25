import { getFirebaseFirestore } from "./firebase";
import {
    collection, query, where, getDocs,
    serverTimestamp, addDoc, limit
} from "firebase/firestore";

const db = getFirebaseFirestore();

export const VERIFIER_COLLECTIONS = {
    PROOFS: "zk_proofs",
    VERIFICATIONS: "verification_history"
};

export const verifierService = {
    /**
     * Verifies a ZK-Proof by its unique ID (hash)
     * In a real system, this would involve mathematical verification of the proof packet.
     * Here, we check the proof registry for a valid ephemeral ID.
     */
    verifyProofID: async (proofID: string, verifierName: string = "Web Node") => {
        const q = query(
            collection(db, VERIFIER_COLLECTIONS.PROOFS),
            where("proofHash", "==", proofID),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return {
                verified: false,
                reason: "Proof ID not found or expired"
            };
        }

        const proofData = snapshot.docs[0].data();

        // Log the verification event
        await addDoc(collection(db, VERIFIER_COLLECTIONS.VERIFICATIONS), {
            proofID,
            verifierName,
            status: "success",
            timestamp: serverTimestamp(),
            disclosedAttributes: proofData.disclosedAttributes || []
        });

        return {
            verified: true,
            details: {
                proofType: "BBS+ Multi-Message",
                attributes: proofData.disclosedAttributes || ["Implicit Possession"],
                credType: proofData.credType
            }
        };
    },

    subscribeToVerifications: (callback: (data: any[]) => void) => {
        const q = query(
            collection(db, VERIFIER_COLLECTIONS.VERIFICATIONS),
            where("status", "==", "success") // Simplified
        );
        // Note: Real-time listener would be better, but we'll use a one-time fetch or snapshot
        // Implementation similar to others
    }
};
