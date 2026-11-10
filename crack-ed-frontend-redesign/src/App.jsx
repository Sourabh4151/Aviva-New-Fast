import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AdmissionStrip from "./components/AdmissionStrip";
import About from "./components/About";
import TrackGrowth from "./components/TrackGrowth";
import CareerGrowth from "./components/CareerGrowth";
import EnrollmentProcess from "./components/EnrollmentProcess";
import ClassroomTraining from "./components/ClassroomTraining";
import Eligibility from "./components/Eligibility";
import Certificate from "./components/Certificate";
import ProgramFee from "./components/ProgramFee";
import Faq from "./components/Faq";
import HaveQuestionsBanner from "./components/HaveQuestionsBanner";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#231f20]">
      <Navbar />
      <div id="navbar-scroll-sentinel" className="h-px w-full pointer-events-none" aria-hidden="true" />
      <Hero />
      <AdmissionStrip />
      <About />
      <TrackGrowth />
      <CareerGrowth />
      <EnrollmentProcess />
      <ClassroomTraining />
      <Eligibility />
      <Certificate />
      <ProgramFee />
      <Faq />
      <HaveQuestionsBanner />
      <Footer />
    </div>
  );
}
