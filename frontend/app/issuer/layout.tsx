"use client";

import React from "react";

/**
 * Root layout for all /issuer routes.
 * This layout is intentionally minimal to avoid wrapping the login page 
 * in dashboard components like Sidebars.
 */
export default function IssuerRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
