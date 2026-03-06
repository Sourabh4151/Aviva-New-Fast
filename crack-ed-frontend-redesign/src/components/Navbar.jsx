import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("navbar-scroll-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleLogoClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeMobile();
    // Scroll to top: scrollIntoView on sentinel works regardless of which element scrolls
    const sentinel = document.getElementById("navbar-scroll-sentinel");
    if (sentinel) {
      sentinel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      document.body.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = (
    <>
      <a href="#about" className="text-white text-sm font-semibold hover:opacity-90" onClick={closeMobile}>
        About Program
      </a>
      <a href="#training" className="text-white text-sm font-semibold hover:opacity-90" onClick={closeMobile}>
        Training
      </a>
      <a href="#enrollment-process" className="text-white text-sm font-semibold hover:opacity-90" onClick={closeMobile}>
        Enrollment Process
      </a>
      <a href="#program-fee" className="text-white text-sm font-semibold hover:opacity-90" onClick={closeMobile}>
        Program Fee
      </a>
    </>
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100] transition-[background-color] duration-200"
      style={{ backgroundColor: scrolled ? "rgba(0,0,0,0.85)" : "transparent" }}
    >
      <nav className={scrolled ? "backdrop-blur-sm" : ""}>
        <div className="nav-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#"
              onClick={handleLogoClick}
              className="focus:outline-none inline-block"
              aria-label="Go to top"
            >
              <img
                src="/src/assets/crack-ed_logo.svg"
                alt="Crack-ED"
                className="w-28 h-8 sm:w-36 sm:h-10 lg:w-[180px] lg:h-[51px] object-contain cursor-pointer"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </a>
          </div>

          {/* Desktop: links (login hidden for now) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks}
          </div>

          {/* Mobile: menu toggle — fixed size, no background */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white hover:text-white/80 transition-colors"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <span className="text-3xl leading-none font-medium tracking-tight">×</span>
              ) : (
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu (login hidden for now) */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 backdrop-blur-sm px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
            {navLinks}
          </div>
        )}
      </nav>
    </header>
  );
}

