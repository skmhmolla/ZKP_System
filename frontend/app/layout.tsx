import type { Metadata, Viewport } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ClientLayout } from "@/components/ClientLayout";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrivaSeal - Universal Privacy-First Verification",
  description: "Verify Anything. Reveal Nothing. Zero-knowledge proofs for universal verification.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrivaSeal",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${firaCode.variable} font-primary antialiased bg-slate-950 text-slate-100 min-h-screen`}
      >
        {/* AuthProvider wraps the entire app — Firebase session persists globally */}
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
