import React from "react";
import Hero from "./components/Hero";
import SimpleSteps from "./components/SimpleSteps";
import TermsAndConditions from "./components/terms_and_conditions";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />
      <SimpleSteps />
      <TermsAndConditions />
    </div>
  );
}
