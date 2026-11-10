import React, { useState } from "react";
import axisLogo from "../assets/figma/axis-logo.png";
import crackEdLogo from "../assets/figma/cracked-logo.png";

const SWOOSH_PATH =
  "M0 0H88L81 1L77 2L74 3L72 4L70 5L68 6L67 7L66 8L64 9L63 10L62 11L61 12V13L60 14L59 15L58 16L57 17V18L56 19L55 20L54 21L53 22V23L52 24L51 25L50 26L49 27V28L48 29L47 30L46 31V32L45 33L44 34L43 35L42 36V37L41 38L40 39L39 40L38 41V42L37 43L36 44L35 45L34 46V47L33 48L32 49L31 50L30 51V52L29 53L28 54L27 55L26 56V57L25 58L24 59L23 60L22 61L21 62L19 63L18 64L16 65L15 66L13 67L10 68L7 69H0Z";

const LINKS = [
  { href: "#about", label: "About Program" },
  { href: "#classroom-training", label: "Training" },
  { href: "#enrollment-process", label: "Enrollment Process" },
  { href: "#program-fee", label: "Program Fee" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const handleLogoClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeMobile();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-t-[24px] border-solid border-[#97144d] bg-[#97144d] lg:bg-white">
      <nav className="flex h-[72px] items-stretch bg-[#97144d] lg:bg-white">
        <a
          href="#hero"
          onClick={handleLogoClick}
          className="flex h-[72px] shrink-0 items-center bg-[#97144d] pl-4 pr-3 sm:pl-8 lg:w-[340.7px] lg:pl-[57px] lg:pr-0"
          aria-label="Go to top"
        >
          <span className="flex -translate-y-3 items-center">
          <img
            src={axisLogo}
            alt="Axis Bank"
            className="h-[24px] w-auto max-w-[96px] object-contain lg:h-[30.51px] lg:w-[120px] lg:max-w-[120px]"
          />
          <span className="mx-2 h-[19px] w-px shrink-0 bg-white lg:mx-4 lg:h-[19.2px]" aria-hidden="true" />
          <span className="relative block h-[28px] w-[96px] shrink-0 overflow-hidden lg:h-[36.64px] lg:w-[128px]">
            <img
              src={crackEdLogo}
              alt="Crack-ED"
              className="absolute max-w-none"
              style={{ width: "115.08%", height: "142.67%", left: "-9.54%", top: "-28%" }}
            />
          </span>
          </span>
        </a>

        <svg
          viewBox="0 0 92 70"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="hidden h-[72px] w-[92px] shrink-0 lg:block"
        >
          <path fill="#97144d" d={SWOOSH_PATH} />
        </svg>

        <div className="hidden h-[72px] min-w-0 flex-1 items-center justify-end gap-6 pr-[57px] lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[14px] font-normal leading-none text-[rgba(34,31,32,0.8)] hover:text-[#97144d]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto flex h-[72px] w-14 items-center justify-center text-white lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <span className="text-3xl leading-none">×</span>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t border-black/10 bg-white px-6 py-4 lg:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="text-[16px] text-[rgba(34,31,32,0.8)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
