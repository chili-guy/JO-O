import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StoriesSection from "@/components/StoriesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem("age-verified") === "true";
  });
  const location = useLocation();

  // Handle scroll to anchor when coming from another page
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      // Small delay to ensure the page is rendered
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <>
      {!isVerified && (
        <AgeVerificationModal onVerified={() => setIsVerified(true)} />
      )}
      
      <div className={`min-h-screen bg-background ${!isVerified ? 'blur-lg pointer-events-none' : ''}`}>
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
