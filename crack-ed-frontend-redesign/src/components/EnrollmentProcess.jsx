import React from "react";
import enrollmentImage from "../assets/enrollment.png";

const STEPS = [
  {
    number: "01",
    title: "Online Application",
    description:
      "Fill in your details, choose your program, and take the first step towards your career journey.",
  },
  {
    number: "02",
    title: "Virtual Interview",
    description:
      "Prepared candidates appear for a virtual interview with the hiring team.",
  },
  {
    number: "03",
    title: "Classroom Training",
    description:
      "Shortlisted candidates undergo 3 weeks of offline classroom training.",
  },
  {
    number: "04",
    title: "Assessment & OJT Allocation",
    description:
      "After training, candidates take the AMCAT test and, upon clearing it, are assigned On-the-Job Training(OJT) at a bank branch.",
  },
  {
    number: "05",
    title: "Program Onboarding",
    description:
      "Begin your learning journey with structured orientation, expectations setting, and readiness alignment.",
  },
];

export default function EnrollmentProcess() {
  const [hoveredStep, setHoveredStep] = React.useState(null);

  return (
    <section
      id="enrollment-process"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        {/* Top: Badge + Heading */}
        <div className="flex flex-col items-start text-left">
          <div
            className="inline-flex items-center justify-center h-[35px] text-sm font-medium tracking-normal rounded-full border border-white/30 py-1 px-[30px] text-white/70 leading-[27px]"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            Enrollment Process
          </div>

          <p
            className="mt-4 sm:mt-6 text-[24px] font-medium tracking-normal leading-[31.2px]"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            A simple, step-by-step process designed to help you get started with
            confidence.
          </p>
        </div>

        {/* Bottom: Image + Steps */}
        <div className="mt-8 sm:mt-12 flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Image card */}
          <div className="flex-1 flex justify-start min-w-0">
          <div
            className="overflow-hidden bg-black w-full max-w-none lg:max-w-[582px] h-[280px] sm:h-[380px] lg:h-[590px] p-0 sm:p-0 lg:p-6 lg:rounded-[10px] enrollment-image-mobile"
          >
            <img
              src={enrollmentImage}
              alt="Enrollment process"
              className="w-full h-full object-cover"
            />
          </div>
          </div>

          {/* Right: Steps */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex flex-col gap-6 sm:gap-8 max-w-full lg:max-w-[426px]">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-row items-stretch gap-3 sm:gap-4"
                  onMouseEnter={() => setHoveredStep(step.number)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {(() => {
                    const isHovered = hoveredStep === step.number;
                    const accentColor = "rgba(10, 49, 82, 1)";
                    const defaultLineColor = "rgba(250,250,250,0.25)";
                    const defaultTextColor = "rgba(250,250,250,1)";

                    return (
                      <>
                        {/* Line for this step */}
                        {/* Mobile: dynamic height line with brand color */}
                        <div
                          className="block lg:hidden flex-shrink-0 w-0 border-l self-stretch"
                          style={{ borderLeftColor: accentColor }}
                        />
                        {/* Desktop: dynamic line that reacts to hover */}
                        <div
                          className="hidden lg:block flex-shrink-0 w-0 self-stretch"
                          style={{
                            borderLeft: `${isHovered ? 2 : 1}px solid ${isHovered ? accentColor : defaultLineColor}`,
                          }}
                        />

                        {/* Text block */}
                        <div
                          className="flex flex-col"
                          style={{
                            gap: 10,
                          }}
                        >
                          <h3
                            className="font-semibold text-[18px] leading-[27px] tracking-normal text-justify min-w-0"
                            style={{
                              fontFamily:
                                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                              color: isHovered ? accentColor : "rgba(250, 250, 250, 1)",
                            }}
                          >
                            {step.number} - {step.title}
                          </h3>
                          <p
                            className="font-normal text-[14px] leading-[21px] tracking-normal text-justify"
                            style={{
                              fontFamily:
                                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                              color: "rgba(250, 250, 250, 0.8)",
                            }}
                          >
                            {step.description}
                          </p>
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

