"use client";

import { useEffect } from "react";
import { getMe } from "@/lib/auth.api";
import { redirectByRole } from "@/lib/roleredirect";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import EarnSection from "@/components/landing/EarnSection";
import ChooseParkerSection from "@/components/landing/ChooseParkerSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PartnersSection from "@/components/landing/PartnersSection";
import AboutSection from "@/components/landing/AboutSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await getMe();
        const role = res.data?.data?.role;

        // Customer stays on landing page, everyone else goes to their dashboard
        if (role && role !== "customer") {
          await redirectByRole(role);
        }
      } catch {
        // Not logged in or no session — stay on landing page, no error
      }
    };

    checkRole();
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <div className="bg-background">
        <Navbar />
      </div>
      <Hero />
      <EarnSection />
      <ChooseParkerSection />
      <HowItWorksSection />
      <PartnersSection />
      <AboutSection />
      <div className="bg-background">
        <Footer />
      </div>
    </main>
  );
}
