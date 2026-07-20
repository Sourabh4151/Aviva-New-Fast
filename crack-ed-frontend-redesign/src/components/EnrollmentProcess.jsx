import React from "react";
import enrollmentImage from "../assets/enrollment.png";

const STEPS = [
  {
    number: "01",
    title: "Apply Online",
    description:
      "Submit your fellowship application and share your entrepreneurial background.",
  },
  {
    number: "02",
    title: "Business Pitch",
    description:
      "Present your business or validated idea through a short concept presentation.",
  },
  {
    number: "03",
    title: "Personal Interview",
    description:
      "Meet the admissions panel to discuss your vision, business potential, and programme fit.",
  },
  {
    number: "04",
    title: "Receive Your Offer",
    description:
      "Secure your seat and receive your onboarding details for the upcoming cohort.",
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
            Your Next Steps
          </div>

          <p
            className="mt-4 sm:mt-6 text-[24px] font-medium tracking-normal leading-[31.2px]"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            Graduate with a certificate, a stronger business, and a lifetime seat at the House of Founders table.
          </p>
        </div>

        {/* Bottom: Image + Steps — image top aligns with step 01 */}
        <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-12">
          {/* Left: Image card — fixed lg height, no stretch */}
          <div
            className="overflow-hidden bg-black w-full h-[280px] sm:h-[380px] lg:h-[330px] lg:w-[408px] lg:max-w-[408px] lg:flex-shrink-0 lg:self-start lg:rounded-[10px] enrollment-image-mobile"
          >
            <img
              src={enrollmentImage}
              alt="Enrollment process"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Steps */}
          <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
            <div className="flex w-full max-w-full flex-col gap-5 sm:gap-6 lg:max-w-[575px]">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-row items-stretch gap-3 sm:gap-4"
                  onMouseEnter={() => setHoveredStep(step.number)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {(() => {
                    const isHovered = hoveredStep === step.number;
                    const accentColor = "rgba(28, 50, 214, 1)";
                    const defaultLineColor = "rgba(250,250,250,0.25)";

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
                          className="flex min-w-0 flex-1 flex-col"
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
                            className="w-full text-justify"
                            style={{
                              fontFamily:
                                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                              fontWeight: 400,
                              fontSize: 14,
                              lineHeight: "21px",
                              letterSpacing: "0%",
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

