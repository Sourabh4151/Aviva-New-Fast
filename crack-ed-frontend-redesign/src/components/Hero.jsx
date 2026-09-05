import React, { useEffect, useState } from "react";

// Import assets so Vite bundles them and production URLs work (raw /src/assets/ paths 404 after build).
import heroImage from "../assets/desk.png";
import DownloadBrochureModal from "./DownloadBrochureModal";
import RequestCallbackModal from "./RequestCallbackModal";
import AdmissionStrip from "./AdmissionStrip";
import { OPEN_REQUEST_CALLBACK_EVENT } from "../utils/requestCallbackModal";

const HERO_STATS = [
  "6 Months Hybrid Program",
  "150+ Hours",
  "6 Hours Weekend Classes",
  "1:1 Mentorship",
  "5 days\nCampus\nImmersion",
];

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
    <section id="hero" className="hero-section relative max-lg:bg-black">
      <div
        className="hero-media w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="House of Founders Fellowship"
      >
        <div
          className="hero-overlay max-lg:relative lg:absolute lg:inset-0 max-lg:min-h-[inherit]"
        >
          <div className="hero-container relative max-lg:pb-10">
            <div className="hero-text-container left-adjust hero-left-adjust">
              <div className="hero-heading-group">
                <h1 className="hero-title">
                  India&apos;s Next Generation of Entrepreneurs
                </h1>
                <p className="hero-tagline">Build the Business, not Just a Plan</p>
              </div>
              <div className="hero-main-text">
                <div className="hero-program-badge">House of Founders Fellowship</div>
                <div className="hero-description-row">
                  <span className="hero-description-line" aria-hidden="true" />
                  <p className="hero-description">
                    A 6-months hands-on fellowship in Entrepreneurship &amp; Venture
                    Creation featuring 5 days campus immersion at India&apos;s top
                    management institute, dedicated one-on-one mentorship, and
                    investor access.
                  </p>
                </div>
                <div className="hero-stats-bar" role="list">
                  {HERO_STATS.map((stat, index) => (
                    <React.Fragment key={stat}>
                      {index > 0 && (
                        <span className="hero-stats-divider" aria-hidden="true" />
                      )}
                      <span className="hero-stats-item" role="listitem">
                        {stat}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="register-btn-wrap hero-cta-row">
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
        <AdmissionStrip />
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
