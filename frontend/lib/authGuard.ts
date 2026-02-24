"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useRequireAdmin() {
    const { currentUser, backendProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!currentUser || backendProfile?.role !== "admin") {
                router.push("/unauthorized?required=admin");
            }
        }
    }, [currentUser, backendProfile, loading, router]);

    return { loading, isAdmin: backendProfile?.role === "admin" };
}

export function useRequireHolder() {
    const { currentUser, backendProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser || backendProfile?.role !== "holder") {
                router.push("/unauthorized?required=holder");
            }
        }
    }, [currentUser, backendProfile, loading, router]);

    return { loading, isHolder: backendProfile?.role === "holder" };
}

export function useRequireVerifier() {
    const { currentUser, backendProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser || backendProfile?.role !== "verifier") {
                router.push("/unauthorized?required=verifier");
            }
        }
    }, [currentUser, backendProfile, loading, router]);

    return { loading, isVerifier: backendProfile?.role === "verifier" };
}
