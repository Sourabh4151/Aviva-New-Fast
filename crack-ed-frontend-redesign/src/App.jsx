import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import CareerGrowth from "./components/CareerGrowth";
import TrainingJourney from "./components/TrainingJourney";
import ClassroomTraining from "./components/ClassroomTraining";
import TrackGrowth from "./components/TrackGrowth";
import Eligibility from "./components/Eligibility";
import EnrollmentProcess from "./components/EnrollmentProcess";
import ProgramFee from "./components/ProgramFee";
import HaveQuestionsBanner from "./components/HaveQuestionsBanner";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Sentinel for navbar scroll background: when this leaves the viewport, navbar gets black background */}
      <div id="navbar-scroll-sentinel" className="h-px w-full pointer-events-none" aria-hidden="true" />
      <Hero />
      <About />
      <CareerGrowth />
      <TrainingJourney />
      <Eligibility />
      <ClassroomTraining />
      <TrackGrowth />
      <EnrollmentProcess />
      <ProgramFee />
      <HaveQuestionsBanner />
      <Footer />
    </div>
  );
}

