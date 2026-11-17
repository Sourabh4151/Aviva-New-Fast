import React, { useEffect, useState } from "react";
import crackEdLogo from "../assets/nav-cracked.svg";
import abclLogo from "../assets/nav-abcl.svg";
import { withUtmParams } from "../utils/utm";

const CRACK_ED_HOME = "https://crack-ed.com/";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHref, setLogoHref] = useState(CRACK_ED_HOME);

  useEffect(() => {
    setLogoHref(withUtmParams(CRACK_ED_HOME));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", mobileOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const wasMobileOpen = mobileOpen;
    closeMobile();
    const run = () => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    };
    if (wasMobileOpen) setTimeout(run, 150);
    else run();
  };

  const links = [
    { href: "#about", label: "About Program", id: "about" },
    { href: "#training", label: "Training", id: "training" },
    { href: "#enrollment-process", label: "Enrollment Process", id: "enrollment-process" },
    { href: "#program-fee", label: "Program Fee", id: "program-fee" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-[100] bg-[#fafafa]">
      <nav className="flex h-[68px] w-full items-stretch">
        <div className="flex shrink-0 items-center gap-2 pl-6 pr-4 sm:gap-3 sm:pl-10 sm:pr-6 lg:pl-16 lg:pr-12">
          <a
            href={logoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
            aria-label="Go to Crack-ED"
          >
            <img src={crackEdLogo} alt="Crack-ED" className="h-[30px] w-auto sm:h-[42px]" />
          </a>
          <span className="h-6 w-px shrink-0 bg-[#d0d0d0]" aria-hidden="true" />
          <img
            src={abclLogo}
            alt="Aditya Birla Capital"
            className="h-[22px] w-auto sm:h-[36px]"
          />
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 rounded-bl-[14px] bg-[#c7222a] pl-6 pr-16 min-[1100px]:flex lg:pl-8 xl:gap-0">
          <div className="flex min-w-0 items-center gap-4 xl:gap-[30px]">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={scrollTo(link.id)}
                className="whitespace-nowrap font-['Anek_Latin',sans-serif] text-[14px] font-normal text-white hover:opacity-90"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#hero"
            onClick={scrollTo("hero")}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] bg-[#fafafa] px-5 py-2 font-['Anek_Latin',sans-serif] text-[14px] font-semibold text-[#c7222a]"
          >
            Apply Now
          </a>
        </div>

        <div className="ml-auto flex items-center pr-6 sm:pr-10 lg:pr-16 min-[1100px]:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#c7222a] text-white"
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
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full flex w-full flex-col gap-4 bg-[#c7222a] px-5 py-[60px] min-[1100px]:hidden">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={scrollTo(link.id)}
              className="font-['Anek_Latin',sans-serif] text-[14px] font-normal leading-none text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={scrollTo("hero")}
            className="inline-flex w-fit items-center justify-center rounded-[100px] bg-white px-5 py-1.5 font-['Anek_Latin',sans-serif] text-[14px] font-semibold leading-none text-[#c7222a]"
          >
            Apply Now
          </a>
        </div>
      )}
    </header>
  );
}
