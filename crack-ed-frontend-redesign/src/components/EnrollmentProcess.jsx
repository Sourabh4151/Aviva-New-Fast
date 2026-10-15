import React from "react";
import enrollmentImage from "../assets/enrollment.png";

const STEPS = [
  {
    number: "01",
    title: "Online Application",
    description:
      "Start your journey by applying online for the Aditya Birla Capital Finishing School Program.",
  },
  {
    number: "02",
    title: "Interview Preparation & Final Interview",
    description:
      "Join a virtual interview preparation session and appear for the Aditya Birla Capital interview.",
  },
  {
    number: "03",
    title: "Provisional Offer",
    description:
      "Receive a provisional offer from Aditya Birla Capital, with your final role confirmed upon completing the training.",
  },
  {
    number: "04",
    title: "Campus Training",
    description:
      "Build your skills through intensive offline classroom training at Crack-ED.",
  },
  {
    number: "05",
    title: "Start Your Career at Aditya Birla Capital",
    description:
      "Upon successful completion, you'll officially join Aditya Birla Capital as a full-time employee.",
  },
  {
    number: "06",
    title: "Internship & OJT",
    description:
      "Gain hands-on experience through 3 months internship and 3 months OJT with Aditya Birla Capital.",
  },
];

export default function EnrollmentProcess() {
  const [hoveredStep, setHoveredStep] = React.useState(null);

  const handleHoverChange = (stepNumber) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setHoveredStep(stepNumber);
    }
  };

  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="flex flex-col items-start text-left">
          <div className="enrollment-pill inline-flex items-center justify-center h-[35px] rounded-full border border-white/30 py-1 px-[30px]">
            Candidate Journey
          </div>

          <p className="enrollment-heading mt-4 sm:mt-6 max-w-[818px]">
            A simple, step-by-step process designed to help you get started with confidence.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 flex justify-start min-w-0">
            <div className="overflow-hidden bg-black w-full max-w-none lg:max-w-[582px] h-[400px] sm:h-[540px] lg:h-[560px] p-0 sm:p-0 lg:p-6 lg:rounded-[10px] enrollment-image-mobile">
              <img
                src={enrollmentImage}
                alt="Enrollment process"
                className="w-full h-full object-cover sm:rounded-[10px]"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex flex-col gap-6 sm:gap-8 max-w-full lg:max-w-[534px]">
              {STEPS.map((step, index) => (
                <div
                  key={step.number}
                  id={index === 0 ? "enrollment-process" : undefined}
                  className={`flex flex-row items-stretch gap-3 sm:gap-4${
                    index === 0 ? " scroll-mt-28 md:scroll-mt-24" : ""
                  }`}
                  onMouseEnter={() => handleHoverChange(step.number)}
                  onMouseLeave={() => handleHoverChange(null)}
                >
                  {(() => {
                    const isHovered = hoveredStep === step.number;
                    const accentColor = "#c7222a";
                    const defaultLineColor = "rgba(250,250,250,0.25)";

                    return (
                      <>
                        <div
                          className="block lg:hidden flex-shrink-0 w-0 border-l self-stretch"
                          style={{ borderLeftColor: accentColor }}
                        />
                        <div
                          className="hidden lg:block flex-shrink-0 w-0 self-stretch"
                          style={{
                            borderLeft: `${isHovered ? 2 : 1}px solid ${isHovered ? accentColor : defaultLineColor}`,
                          }}
                        />

                        <div className="flex flex-col gap-[10px] min-w-0">
                          <h3
                            className="enrollment-step-title"
                            style={{
                              color: isHovered ? accentColor : "rgba(250, 250, 250, 1)",
                            }}
                          >
                            {step.number} - {step.title}
                          </h3>
                          <p className="enrollment-step-desc">{step.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
