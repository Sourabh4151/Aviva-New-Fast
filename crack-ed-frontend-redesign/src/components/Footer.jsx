import React, { useEffect, useState } from "react";
import { withUtmParams } from "../utils/utm";

const policyLinks = [
  { label: "Refund Policy", href: "https://crack-ed.com/refund-policy" },
  { label: "Privacy Policy", href: "https://crack-ed.com/privacy-policy" },
  { label: "Terms & Conditions", href: "https://crack-ed.com/terms-conditions" },
];

export default function Footer() {
  const [links, setLinks] = useState(policyLinks);

  useEffect(() => {
    setLinks(
      policyLinks.map((link) => ({
        ...link,
        href: withUtmParams(link.href),
      }))
    );
  }, []);

  return (
    <footer className="bg-[#fafafa]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-[120px] lg:py-10">
        <div className="hidden w-full border-t border-[#e6e6e6] lg:block" />
        <div className="flex flex-col gap-3 pt-0 lg:flex-row lg:items-center lg:justify-between lg:pt-6">
          <p className="footer-text order-3 lg:order-1">© 2026 Crack-ED. All rights reserved.</p>
          <div className="order-2 h-px w-full bg-[#e6e6e6] lg:hidden" />
          <nav className="order-1 flex flex-col items-start gap-2 lg:order-2 lg:flex-row lg:items-center lg:gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text transition-colors hover:text-[#231f20]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
