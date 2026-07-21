import React, { useEffect, useState } from "react";

// Import assets so Vite bundles them and production URLs work (raw /src/assets/ paths 404 after build).
import heroImage from "../assets/desk.png";
import tickSvg from "../assets/tick.svg";
import scholarSvg from "../assets/scholar.svg";
import DownloadBrochureModal from "./DownloadBrochureModal";
import RequestCallbackModal, {
  OPEN_REQUEST_CALLBACK_EVENT,
} from "./RequestCallbackModal";

export default function Hero() {
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    function onOpenApply() {
      setShowApplyModal(true);
    }
    window.addEventListener(OPEN_REQUEST_CALLBACK_EVENT, onOpenApply);
    return () => window.removeEventListener(OPEN_REQUEST_CALLBACK_EVENT, onOpenApply);
  }, []);

  return (
    <section id="hero" className="relative max-lg:bg-black">
      <div
        className="w-full min-h-[520px] sm:min-h-[600px] lg:h-[690px] lg:min-h-0 bg-cover bg-center bg-no-repeat relative max-lg:overflow-visible lg:overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Aviva hero"
      >
        <div
          className="max-lg:relative lg:absolute lg:inset-0 max-lg:min-h-[inherit]"
          style={{
            zIndex: 10,
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.8)), linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.5) 85%, rgba(0, 0, 0, 0.85) 95%, rgba(0, 0, 0, 1) 100%)",
          }}
        >
          <div className="absolute left-0 right-0 bottom-0 h-8 bg-black pointer-events-none max-lg:hidden" />
          <div className="hero-container relative max-lg:pb-8">
            <div className="absolute left-[120px] top-[70px] w-[586px] max-w-[calc(100%-2rem)] text-white left-adjust hero-left-adjust max-lg:px-1">
              <div className="hero-logo-badge mb-3 md:mb-4">
                <div className="hero-badge mt-4 md:mt-6 inline-flex items-center justify-center">
                  Entrepreneurship & Venture Creation
                </div>
              </div>
              <h1 className="hero-title text-[32px] md:text-[40px] lg:text-[48px] font-semibold leading-[1] mb-3 md:mb-4">
                House of Founders Fellowship
              </h1>
              {/* Mobile: 3 concise points (design spec) */}
              <ul className="hero-bullet-list md:hidden">
                <li className="flex items-start gap-2">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    6-month hybrid fellowship for aspiring and existing entrepreneurs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    156 hours of hybrid curriculum with 8+ hours of founder-led mentorship.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    Pitch your venture to investors with opportunities for select participants.*
                  </span>
                </li>
              </ul>

              {/* Desktop / tablet: fuller bullet list */}
              <ul className="hero-bullet-list hidden md:block space-y-4 mb-4">
                <li className="flex items-center gap-3">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    A 6 month hybrid fellowship designed for existing and aspiring entreprenuers
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    Get 8 hours of mentorship by startup founders to learn the nuances and recieve practical wisdom.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    156 hours of intensive, hybrid curriculum covering everything from ideation to execution.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="hero-tick shrink-0">
                    <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                  </span>
                  <span className="hero-subtitle">
                    Opportunity for select particpants to pitch your venture for investement*
                  </span>
                </li>
              </ul>
              <div className="hero-campus-immersion">
                <img
                  src={scholarSvg}
                  alt=""
                  width={24}
                  height={24}
                  className="hero-campus-immersion-icon hidden md:block"
                  aria-hidden="true"
                />
                <span className="hero-campus-immersion-text">
                  Campus Immersion at a Leading Management Institute
                </span>
              </div>
              <div className="register-btn-wrap hero-cta-row mt-8 md:mt-4">
                <button
                  type="button"
                  className="apply-now-btn border-0"
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  className="download-brochure-btn"
                  onClick={() => setShowBrochureModal(true)}
                >
                  Download Brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DownloadBrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
      />
      <RequestCallbackModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </section>
  );
}
