import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StoriesSection from "@/components/StoriesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const STORAGE_KEY = "age-verified";

function readVerified(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

const Index = () => {
  const [isVerified, setIsVerified] = useState(readVerified);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location.hash]);

  const handleVerified = () => setIsVerified(true);

  return (
    <>
      {!isVerified && <AgeVerificationModal onVerified={handleVerified} />}
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <StoriesSection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
