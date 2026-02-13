import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import EarnSection from "@/components/landing/EarnSection";
import ChooseParkerSection from "@/components/landing/ChooseParkerSection";
import PartnersSection from "@/components/landing/PartnersSection";
import AboutSection from "@/components/landing/AboutSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <div className="bg-background">
        <Navbar />
      </div>
      <Hero />
      <EarnSection />
      <ChooseParkerSection />
      <PartnersSection />
      <AboutSection />
      <div className="bg-background">
        <Footer />
      </div>
    </main>
  );
}
