"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { Applications } from "@/components/landing/Applications";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="premium-dark min-h-screen bg-background selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic Background elements that span across sections */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />

      <Navbar />

      <main>
        <Hero />

        <div className="relative">
          {/* Subtle separator glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <ProblemSection />
        </div>

        <SolutionSection />



        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
          <Applications />
        </div>

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
