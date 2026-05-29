import React from "react";

const policyLinks = [
  { label: "Refund Policy", href: "https://crack-ed.com/refund-policy" },
  { label: "Privacy Policy", href: "https://crack-ed.com/privacy-policy" },
  { label: "Terms & Conditions", href: "https://crack-ed.com/terms-conditions" },
];

export default function Footer() {
  return (
    <footer className="bg-[rgba(5,5,5,1)]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-[120px] lg:py-[48px]">
        <div className="hidden w-full border-t border-[rgba(250,250,250,0.1)] lg:block" />
        <div className="flex flex-col gap-3 pt-0 lg:flex-row lg:items-center lg:justify-between lg:pt-6">
          <nav className="order-1 flex flex-col items-start gap-2 lg:order-2 lg:flex-row lg:items-center lg:gap-x-8 lg:gap-y-2">
            {policyLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] leading-[24px] font-semibold text-[rgba(250,250,245,1)] hover:text-white transition-colors"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="order-2 h-px w-full bg-[rgba(250,250,250,0.1)] lg:hidden" />
          <p
            className="order-3 text-[12px] leading-[24px] font-semibold text-[rgba(250,250,245,1)] lg:order-1"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            © 2026 Crack-ED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
