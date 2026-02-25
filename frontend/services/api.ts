const API_BASE = ""; // Uses Next.js rewrites to proxy to backend

export const api = {
    issuer: {
        init: async () => {
            const res = await fetch(`${API_BASE}/api/issuer/init`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to init issuer");
            return await res.json();
        },

        getPublicKey: async (): Promise<string> => {
            const res = await fetch(`${API_BASE}/api/issuer/init`, { method: "POST" });
            if (!res.ok) return "mock_pk_12345";
            const data = await res.json();
            return data.public_key;
        },

        issueCredential: async (type: string, attributes: Record<string, any>): Promise<any> => {
            const res = await fetch(`${API_BASE}/api/issuer/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    credential_type: type,
                    attributes: attributes
                }),
            });
            if (!res.ok) throw Error("Failed to issue credential");
            return await res.json();
        },

        getIssued: async (page = 1, search = "") => {
            const res = await fetch(`${API_BASE}/api/issuer/issued?page=${page}&search=${search}`);
            if (!res.ok) throw Error("Failed to fetch issued credentials");
            return await res.json();
        },

        pendingRequests: async () => {
            const res = await fetch(`${API_BASE}/api/issuer/pending-requests`);
            if (!res.ok) throw Error("Failed to fetch pending requests");
            return await res.json();
        },

        approve: async (id: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/approve/${id}`, { method: "POST" });
            if (!res.ok) throw Error("Approval failed");
            return await res.json();
        },

        reject: async (id: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/reject/${id}`, { method: "POST" });
            if (!res.ok) throw Error("Rejection failed");
            return await res.json();
        },

        revoke: async (id: string, reason = "Revoked by issuer") => {
            const res = await fetch(`${API_BASE}/api/issuer/issued/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            return await res.json();
        },

        getStats: async () => {
            const res = await fetch(`${API_BASE}/api/issuer/stats`);
            if (!res.ok) return { totalIssued: 0, activeCredentials: 0, activePercent: 0, typesSupported: 0, pendingRequests: 0 };
            return await res.json();
        }
    },

    holder: {
        requestVerification: async (userId: string, documents: string[] = []) => {
            const res = await fetch(`${API_BASE}/api/privaseal/holder/request-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, documents })
            });
            if (!res.ok) throw Error("Failed to submit identity request");
            return await res.json();
        },

        getCredential: async (userId: string) => {
            const res = await fetch(`${API_BASE}/api/privaseal/holder/credential/${userId}`);
            if (!res.ok) throw Error("Failed to fetch credential");
            return await res.json();
        },

        generateProof: async (attributes: any) => {
            const res = await fetch(`${API_BASE}/api/privaseal/holder/generate-proof`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attributes })
            });
            if (!res.ok) throw Error("Failed to generate ZK proof");
            return await res.json();
        }
    },

    verifier: {
        createRequest: async (predicateKey: string) => {
            const res = await fetch(`${API_BASE}/api/verifier/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    predicate_key: predicateKey,
                    verifier_id: "privaseal-verifier-web",
                    verifier_name: "PrivaSeal Web Verifier"
                }),
            });
            if (!res.ok) throw new Error("Failed to create verification request");
            const data = await res.json();
            return {
                requestId: data.request.id,
                qrCode: data.request.qrUri,
                predicate: data.request.predicateLabel
            };
        },

        submitProof: async (requestId: string, proof: any, revealed: any, issuerPublicKey: string) => {
            const res = await fetch(`${API_BASE}/api/verifier/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: requestId,
                    proof: typeof proof === 'string' ? proof : JSON.stringify(proof),
                    revealed_attributes: revealed,
                    issuer_public_key: issuerPublicKey
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            const data = await res.json();
            return {
                verified: data.verified,
                request: data.request
            };
        },

        getStats: async () => {
            const res = await fetch(`${API_BASE}/api/verifier/stats`);
            if (!res.ok) return { totalRequests: 0, verified: 0, failed: 0, pending: 0, successRate: 0 };
            return await res.json();
        }
    }
};
