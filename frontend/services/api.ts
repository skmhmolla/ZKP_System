const API_BASE = ""; // Uses Next.js rewrites to proxy to backend (now Node.js /api)

// Helper for passing Firebase UID
const getHeaders = (uid?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (uid) headers["x-firebase-uid"] = uid;
    return headers;
};

export const api = {
    auth: {
        syncSession: async (firebaseUID: string, email: string, role: string) => {
            const res = await fetch(`${API_BASE}/api/auth/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firebaseUID, email, role })
            });
            if (!res.ok) throw new Error("Failed to sync session");
            return await res.json();
        },
        getMe: async (firebaseUID: string) => {
            const res = await fetch(`${API_BASE}/api/auth/me/${firebaseUID}`);
            if (!res.ok) throw new Error("User not found");
            return await res.json();
        }
    },
    issuer: {
        getStats: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/dashboard/stats`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch stats");
            return await res.json();
        },
        pendingRequests: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/requests/pending`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch pending requests");
            return await res.json();
        },
        getRequestDetails: async (uid: string, id: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/requests/pending/${id}`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch request details");
            return await res.json();
        },
        approve: async (uid: string, id: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/requests/approve/${id}`, {
                method: "POST", headers: getHeaders(uid)
            });
            if (!res.ok) throw Error("Approval failed");
            return await res.json();
        },
        reject: async (uid: string, id: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/requests/reject/${id}`, {
                method: "POST", headers: getHeaders(uid)
            });
            if (!res.ok) throw Error("Rejection failed");
            return await res.json();
        },
        getPendingVerifiers: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/verifiers/pending`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch pending verifiers");
            return await res.json();
        },
        approveVerifier: async (uid: string, verifierUid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/verifiers/approve/${verifierUid}`, {
                method: "POST", headers: getHeaders(uid)
            });
            if (!res.ok) throw Error("Verifier approval failed");
            return await res.json();
        },
        getApprovedVerifiers: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/verifiers/list`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch verifiers");
            return await res.json();
        },
        deleteVerifier: async (uid: string, verifierUid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/verifiers/delete/${verifierUid}`, {
                method: "DELETE", headers: getHeaders(uid)
            });
            if (!res.ok) throw Error("Verifier deletion failed");
            return await res.json();
        },
        getAuditLogs: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/audit`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch audit logs");
            return await res.json();
        }
    },
    holder: {
        submitRequest: async (uid: string, data: any) => {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (uid) headers["x-firebase-uid"] = uid;

            const res = await fetch(`${API_BASE}/api/wallet/request`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to submit identity request");
            }
            return await res.json();
        },
        getDashboardInfo: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/wallet/dashboard`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch dashboard info");
            return await res.json();
        },
        getCredentials: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/wallet/list`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch credentials list");
            return await res.json();
        },
        getActivity: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/wallet/activity`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch activity logs");
            return await res.json();
        }
    },
    verifier: {
        getDashboardInfo: async (uid: string) => {
            const res = await fetch(`${API_BASE}/api/verifier/dashboard`, { headers: getHeaders(uid) });
            if (!res.ok) throw new Error("Failed to fetch dashboard info");
            return await res.json();
        },
        verifyCredential: async (uid: string, credentialId: string) => {
            const res = await fetch(`${API_BASE}/api/verifier/verify`, {
                method: "POST",
                headers: getHeaders(uid),
                body: JSON.stringify({ credentialId })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Verification failed");
            }
            return await res.json();
        }
    }
};
