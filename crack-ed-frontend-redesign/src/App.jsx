import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
// import About from "./components/About";
// import CareerGrowth from "./components/CareerGrowth";
// import WhyThisFellowship from "./components/WhyThisFellowship";
import InvestorReadiness from "./components/InvestorReadiness";
import TrainingJourney from "./components/TrainingJourney";
import ClassroomTraining from "./components/ClassroomTraining";
// import TrackGrowth from "./components/TrackGrowth";
import Eligibility from "./components/Eligibility";
import EnrollmentProcess from "./components/EnrollmentProcess";
import ProgramFee from "./components/ProgramFee";
import FAQ from "./components/FAQ";
import HaveQuestionsBanner from "./components/HaveQuestionsBanner";
import VoiceOfLeadership from "./components/VoiceOfLeadership";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Sentinel for navbar scroll background: when this leaves the viewport, navbar gets black background */}
      <div id="navbar-scroll-sentinel" className="h-px w-full pointer-events-none" aria-hidden="true" />
      <Hero />
      <VoiceOfLeadership />
      {/* <About /> */}
      {/* <CareerGrowth /> */}
      {/* <WhyThisFellowship /> */}
      {/* <InvestorReadiness /> */}
      <TrainingJourney />
      <ClassroomTraining />
      {/* <TrackGrowth /> */}
      <Eligibility />
      <EnrollmentProcess />
      <ProgramFee />
      <FAQ />
      <HaveQuestionsBanner />
      <Footer/>
    </div>
  );
}

