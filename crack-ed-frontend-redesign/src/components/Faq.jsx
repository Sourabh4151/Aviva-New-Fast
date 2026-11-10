import React, { useState } from "react";
import chevron from "../assets/figma/faq-chevron.svg";

const PROGRAM_FAQS = [
  {
    question: "What is the Axis Bank Virtual Relationship Manager Program?",
    answer:
      "This is a job-assured mandate program presented by Crack-ED in partnership with Axis Bank, under the Priority and NRI Segment, designed to prepare eligible graduates for banking roles through structured training, assessments and a selection process aligned with Axis Bank's requirements.",
  },
  {
    question: "Who is eligible to apply for the program?",
    answer:
      "Candidates between the ages of 21 to 26 with minimum 50% in graduation or postgraduation are eligible to apply for this program. They should have strong communication skills in English and the local language. CIBIL score must be 650 and above and the candidate must be willing to join the job location offered by Axis Bank for this role.",
  },
  {
    question: "What is the duration and structure of the program?",
    answer:
      "The Virtual Relationship Manager (VRM) program includes 5 weeks of virtual training, followed by New Joiners Training and On-the-Job Training. It also includes post-assessment for both the trainings.",
  },
  {
    question: "How do I apply for the program?",
    answer: "Complete the online application form and our counselors will connect with you.",
  },
  {
    question: "What is the selection process?",
    answer:
      "The selection process typically includes online registration, internal screening, aptitude test, an online interview, and a business round for final screening. Selected candidates receive further instructions regarding admission and joining formalities.",
  },
  {
    question: "Where is the training conducted?",
    answer:
      "The training is conducted in online mode. Exact schedule will be communicated to selected candidates upon their selection.",
  },
  {
    question: "What happens if I do not clear an assessment?",
    answer:
      "It is mandatory to clear the assessment for onboarding. Re-attempts are allowed in post-training assessment.",
  },
  {
    question: "What is the program fee, and how can I pay it?",
    answer:
      "The program fee is ₹58,410 and can be paid fully upfront or through loan assistance. Candidates will have to pay the enrollment fee of ₹2360 (non-refundable) over and above the program fee which will cover the interview preparation and assessment fees.",
  },
  {
    question: "Can I pay the fee without availing the loan facility?",
    answer: "Yes, the candidate can self-fund their program fees.",
  },
  {
    question: "Does completing the program guarantee employment?",
    answer:
      "Only completing the program does not guarantee employment. Clearing NJT and OJT is mandatory for final onboarding.",
  },
];

const JOB_FAQS = [
  {
    question: "What is the job role offered by this program?",
    answer:
      "Successful candidates are offered an Assistant Manager position in Virtual Relationship Management (VRM) – Priority & NRI Segment.",
  },
  {
    question: "What are the main job responsibilities?",
    answer:
      "The job responsibilities include driving revenue growth across the mapped Priority & NRI portfolios by achieving monthly targets through CASA deepening, lead generation, and cross-selling investment, asset, card and liability products. You will be required to deliver premium customer service through proactive relationship management, banking support and market updates while ensuring adherence to internal policies and regulatory requirements.",
  },
  {
    question: "What salary can I expect after joining Axis Bank?",
    answer:
      "The exact CTC is ₹3,56,442 LPA for all the job locations across India except Hyderabad. The exact CTC for Hyderabad is ₹3,35,874 LPA.",
  },
  {
    question: "What is job timings?",
    answer:
      "The role is rotational shifts and week offs.\nWork hours for Women: - Till 9 PM (rotational shifts).\nWork hours for Males:- 24*7 rotational shifts",
  },
];

const TABS = [
  { id: "program", label: "Program & Admission Related", items: PROGRAM_FAQS },
  { id: "job", label: "Job, Role & Compensation related", items: JOB_FAQS },
];

export default function Faq() {
  const [tab, setTab] = useState("program");
  const [open, setOpen] = useState(-1);
  const items = TABS.find((item) => item.id === tab).items;

  return (
    <section id="faq" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-6 py-12 sm:px-10 lg:px-[160px] lg:py-12">
        <h2 className="text-[32px] font-semibold leading-[48px] text-[#9d2257]">FAQ’S</h2>
        <div className="flex flex-col sm:flex-row sm:py-2">
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setOpen(-1);
                }}
                className={`flex flex-1 items-center justify-center px-4 py-2 text-center text-[16px] font-semibold leading-normal sm:text-[20px] sm:leading-[48px] ${
                  active ? "bg-[#97144d] text-[#fafafa]" : "bg-[#ffe7f1] text-[#9d2257]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-4">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.question} className="rounded-[8px] bg-[rgba(209,211,212,0.5)] p-2">
                <button
                  type="button"
                  className="flex min-h-[24px] w-full items-center gap-2.5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span className="flex-1 text-[14px] leading-6 text-[rgba(34,31,32,0.8)]">
                    {index + 1}. {item.question}
                  </span>
                  <img
                    src={chevron}
                    alt=""
                    className={`h-6 w-6 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="whitespace-pre-line px-1 pb-2 pt-2 text-[14px] leading-6 text-[rgba(34,31,32,0.8)]">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
