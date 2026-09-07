import React, { useState } from "react";

const PHONE_NUMBER = "8810331340";

export default function StickyMobileIcon() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCallClick = () => {
    window.location.href = `tel:${PHONE_NUMBER}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Talk to Us Card - shown when expanded */}
      {isOpen && (
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "24px",
            minWidth: "240px",
          }}
        >
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p
                style={{
                  fontFamily: "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "rgba(250, 250, 250, 1)",
                }}
              >
                Talk to Us
              </p>
              <p
                style={{
                  fontFamily: "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "rgba(250, 250, 250, 0.6)",
                }}
              >
                Our counsellors are here to help
              </p>
            </div>

            {/* Phone number display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="rgba(250, 250, 250, 1)"
                />
              </svg>
              <span
                style={{
                  fontFamily: "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "rgba(250, 250, 250, 1)",
                }}
              >
                {PHONE_NUMBER}
              </span>
            </div>

            {/* Call Now Button */}
            <button
              onClick={handleCallClick}
              className="w-full rounded-[10px] cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:opacity-70"
              style={{
                fontFamily: "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "100%",
                color: "rgba(250, 250, 250, 1)",
                padding: "14px 24px",
                backgroundColor: "rgba(3, 149, 218, 1)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    fill="rgba(250, 250, 250, 1)"
                  />
                </svg>
                Call Now
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Mobile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{
          background: "rgba(3, 149, 218, 1)",
          boxShadow: "0 8px 32px rgba(3, 149, 218, 0.3), 0 4px 16px rgba(0, 0, 0, 0.3)",
        }}
        aria-label={isOpen ? "Close talk to us" : "Open talk to us"}
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[rgba(3, 149, 218, 1)]" />
        
        {/* Phone icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            fill="rgba(250, 250, 250, 1)"
          />
        </svg>
      </button>
    </div>
  );
}