import React from "react";
import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import WhoCanJoinSection from "./components/WhoCanJoinSection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <WhoCanJoinSection />
      <Footer />
    </div>
  );
}
