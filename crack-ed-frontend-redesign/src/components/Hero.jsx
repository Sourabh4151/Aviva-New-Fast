import React, { useState, useRef, useEffect } from "react";

import heroImage from "../assets/desk.png";
import tickSvg from "../assets/tick.svg";
import crackedLogo from "../assets/crack-ed.svg";

import stateCities from "../data/indian_state_cities.json";

const INDIAN_STATES = Object.keys(stateCities).sort((a, b) => a.localeCompare(b));
const MAX_FILTERED_OPTIONS = 100;

function filterByQuery(options, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return options;
  return options.filter((item) => item.toLowerCase().startsWith(q));
}

function friendlyBackendError(err) {
  const msg = (err && typeof err === "object" && "message" in err ? err.message : "") || "";
  const lowered = String(msg).toLowerCase();
  const backendDown =
    err?.name === "TypeError" ||
    lowered.includes("failed to fetch") ||
    lowered.includes("networkerror") ||
    lowered.includes("econnrefused") ||
    lowered.includes("load failed");

  if (backendDown) {
    return "Service is temporarily unavailable. Please try again in a moment.";
  }
  return msg || "Something went wrong. Please try again.";
}

function SectionHeader({ title }) {
  return (
    <div className="referral-section-header">
      <span className="referral-section-bar" aria-hidden="true" />
      <span className="referral-section-title">{title}</span>
    </div>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="referral-field-label">
      {children}
      <span className="referral-required" aria-hidden="true">
        {" "}
        *
      </span>
    </label>
  );
}

function ChevronDown() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 8L10 12L14 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  const [form, setForm] = useState({
    candidateName: "",
    candidateMobile: "",
    candidateState: "",
    candidateCity: "",
    referrerName: "",
    referrerMobile: "",
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityHintActive, setCityHintActive] = useState(false);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({
    title: "Thank you for your referral!",
    description:
      "We've received your submission. Our team will reach out to the candidate shortly.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedState = INDIAN_STATES.find(
    (s) => s.toLowerCase() === (form.candidateState || "").trim().toLowerCase()
  );
  const citiesForState = matchedState
    ? [...(stateCities[matchedState] || [])].sort((a, b) => a.localeCompare(b))
    : [];
  const filteredStates = filterByQuery(
    INDIAN_STATES,
    stateOpen ? stateQuery : form.candidateState
  ).slice(0, MAX_FILTERED_OPTIONS);
  const filteredCities = filterByQuery(
    citiesForState,
    cityOpen ? cityQuery : form.candidateCity
  ).slice(0, MAX_FILTERED_OPTIONS);

  useEffect(() => {
    function onClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    }
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, []);

  useEffect(() => {
    if (matchedState) setCityHintActive(false);
  }, [matchedState]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleMobileChange(e) {
    const { name } = e.target;
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const {
      candidateName,
      candidateMobile,
      candidateState,
      candidateCity,
      referrerName,
      referrerMobile,
    } = form;
    const newErrors = {};

    if (!candidateName.trim()) newErrors.candidateName = "Candidate full name is required.";
    if (!candidateMobile.trim()) newErrors.candidateMobile = "Candidate mobile is required.";
    else if (!/^\d{10}$/.test(candidateMobile))
      newErrors.candidateMobile = "Mobile must be 10 digits.";

    const stateMatch = INDIAN_STATES.find(
      (s) => s.toLowerCase() === (candidateState || "").trim().toLowerCase()
    );
    if (!candidateState.trim()) newErrors.candidateState = "State is required.";
    else if (!stateMatch) newErrors.candidateState = "Please select a valid state from the list.";

    const cityList = stateMatch ? stateCities[stateMatch] || [] : [];
    const cityMatch = cityList.find(
      (c) => c.toLowerCase() === (candidateCity || "").trim().toLowerCase()
    );
    if (!candidateCity.trim()) newErrors.candidateCity = "City is required.";
    else if (!cityMatch) newErrors.candidateCity = "Please select a valid city from the list.";

    if (!referrerName.trim()) newErrors.referrerName = "Your name is required.";
    if (!referrerMobile.trim()) newErrors.referrerMobile = "Your mobile is required.";
    else if (!/^\d{10}$/.test(referrerMobile))
      newErrors.referrerMobile = "Mobile must be 10 digits.";
    else if (referrerMobile === candidateMobile)
      newErrors.referrerMobile = "Your number must be different from the candidate's number.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatus({ type: "info", message: "Submitting..." });

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setStatus({
        type: "error",
        message: "Service is temporarily unavailable. Please try again later.",
      });
      setIsSubmitting(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get("utm_source") || "";
    const utm_medium = urlParams.get("utm_medium") || "";
    const utm_campaign = urlParams.get("utm_campaign") || "";

    try {
      const res = await fetch(`${baseUrl}/auth/referral/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: candidateName.trim(),
          candidate_mobile: candidateMobile,
          candidate_state: stateMatch || candidateState,
          candidate_city: cityMatch || candidateCity,
          referrer_name: referrerName.trim(),
          referrer_mobile: referrerMobile,
          utm_source,
          utm_medium,
          utm_campaign,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const alreadyReferred =
          json.message && json.message.toLowerCase().includes("already been referred");
        setStatus(null);
        setPopupMessage(
          alreadyReferred
            ? {
                title: "Candidate already referred",
                description:
                  json.message ||
                  "This candidate has already been referred. Thank you for your support!",
              }
            : {
                title: "Referral submitted successfully!",
                description:
                  json.message ||
                  "We've received your referral. Our team will reach out to the candidate shortly.",
              }
        );
        setShowPopup(true);
      } else {
        setStatus({
          type: "error",
          message: json.error || json.message || "Failed to submit referral",
        });
      }
    } catch (err) {
      setStatus({ type: "error", message: friendlyBackendError(err) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClosePopup() {
    setShowPopup(false);
    try {
      window.location.reload();
    } catch {
      // ignore if window not available
    }
  }

  return (
    <section id="hero" className="relative max-lg:bg-black">
      <nav
        className="hero-navbar absolute top-0 left-0 right-0 z-40 h-[75px] flex items-center justify-between px-4 sm:px-6 lg:px-[60px] py-3"
        style={{ backgroundColor: "rgba(30, 30, 30, 0.02)" }}
      >
        <img
          src={crackedLogo}
          alt="CRACK-ED"
          className="block w-[164px] h-[41px] lg:w-[180px] lg:h-[51px] object-contain"
        />
      </nav>

      <div className="hero-stage relative w-full">
        <div className="hero-bg-wrap w-full max-lg:min-h-0 lg:min-h-[690px] lg:absolute lg:inset-0 overflow-hidden">
          <div className="hero-bg-pan" aria-hidden="true">
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="hero-bg-image"
            />
          </div>
        </div>
        <div
          className="hero-gradient absolute inset-0 pointer-events-none w-full"
          style={{
            zIndex: 10,
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.8)), linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.5) 85%, rgba(0, 0, 0, 0.85) 95%, rgba(0, 0, 0, 1) 100%)",
          }}
        />
        <div className="absolute left-0 right-0 bottom-0 h-8 bg-black pointer-events-none z-10" />

        <div className="hero-content-shell relative z-20">
          <div className="hero-left-adjust text-white">
            <h1
              className="hero-title text-[40px] lg:text-[48px] font-semibold leading-[100%] tracking-[0em] text-[rgba(250,250,250,1)] mb-4"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Help a friend get placed. Earn a commission of{" "}
              <span className="text-[#1A9EB7]">Rs 10,000</span>
            </h1>
            <ul className="hero-bullet-list text-gray-200 space-y-3 mb-8 max-lg:mb-0">
              <li className="flex items-start gap-2 sm:gap-3">
                <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                <span
                  className="hero-subtitle text-[16px] leading-[100%] font-normal tracking-[0em] text-[rgba(250,250,250,1)]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span className="font-semibold">Completely Free:</span> No hidden fees or
                  registration required.
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                <span
                  className="hero-subtitle text-[16px] leading-[100%] font-normal tracking-[0em] text-[rgba(250,250,250,1)]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span className="font-semibold">Quick 7-Day Payout:</span> Money hits your
                  account 7 days post-enrollment.
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                <span
                  className="hero-subtitle text-[16px] leading-[100%] font-normal tracking-[0em] text-[rgba(250,250,250,1)]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span className="font-semibold">Extra ₹2,000 Included:</span> Get an extra ₹2,000
                  bonus on every admission this month!
                </span>
              </li>
            </ul>
          </div>

          <aside className="hero-form-card referral-form-card w-full">
            <form onSubmit={handleSubmit} className="referral-form flex flex-col gap-8">
          {status?.message && status.type !== "info" && (
            <div
              className={`relative flex items-start gap-2 rounded-[10px] px-4 py-3 border ${
                status.type === "error"
                  ? "border-[rgba(248,113,113,0.9)] bg-[rgba(127,29,29,0.98)]"
                  : "border-[rgba(34,197,94,0.35)] bg-gradient-to-r from-[rgba(34,197,94,0.18)] to-[rgba(34,197,94,0.06)]"
              }`}
              role={status.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              <p className="text-sm font-normal pr-6 flex-1 text-[rgba(250,250,250,0.92)]">
                {status.message}
              </p>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded text-[rgba(250,250,250,0.75)] hover:bg-[rgba(0,0,0,0.35)] transition-colors"
                aria-label="Dismiss"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          )}

          <div className="referral-form-section flex flex-col gap-4">
            <SectionHeader title="Candidate's Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="candidateName">Candidate&apos;s Full Name</FieldLabel>
                <input
                  id="candidateName"
                  name="candidateName"
                  value={form.candidateName}
                  onChange={handleChange}
                  required
                  placeholder="Enter their name"
                  className="referral-input"
                />
                {errors.candidateName && (
                  <p className="referral-field-error">{errors.candidateName}</p>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="candidateMobile">Candidate&apos;s Mobile Number</FieldLabel>
                <input
                  id="candidateMobile"
                  name="candidateMobile"
                  type="tel"
                  inputMode="numeric"
                  value={form.candidateMobile}
                  onChange={handleMobileChange}
                  required
                  placeholder="Enter mobile number"
                  className="referral-input"
                />
                {errors.candidateMobile && (
                  <p className="referral-field-error">{errors.candidateMobile}</p>
                )}
              </div>
              <div ref={stateRef} className="relative">
                <FieldLabel htmlFor="candidateState">Candidate&apos;s State</FieldLabel>
                <div className="relative flex items-center">
                  <input
                    id="candidateState"
                    type="text"
                    placeholder="Select state"
                    value={stateOpen ? stateQuery : form.candidateState}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStateQuery(value);
                      setStateOpen(true);
                      setForm((prev) => ({
                        ...prev,
                        candidateState: value,
                        candidateCity: prev.candidateState === value ? prev.candidateCity : "",
                      }));
                      if (errors.candidateState) setErrors((prev) => ({ ...prev, candidateState: "" }));
                    }}
                    onFocus={() => {
                      setStateQuery(form.candidateState);
                      setStateOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setStateOpen(false);
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={stateOpen}
                    aria-haspopup="listbox"
                    className="referral-input referral-select-input"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Toggle state list"
                    onClick={() => {
                      setStateQuery(form.candidateState);
                      setStateOpen((open) => !open);
                    }}
                    className="referral-select-chevron"
                  >
                    <ChevronDown />
                  </button>
                </div>
                {stateOpen && (
                  <ul role="listbox" className="referral-options">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((s) => (
                        <li
                          key={s}
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, candidateState: s, candidateCity: "" }));
                            setStateQuery(s);
                            setCityQuery("");
                            setErrors((prev) => ({ ...prev, candidateState: "", candidateCity: "" }));
                            setStateOpen(false);
                            setCityOpen(false);
                          }}
                          className="referral-option"
                        >
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="referral-option-muted">No matching states</li>
                    )}
                  </ul>
                )}
                {errors.candidateState && (
                  <p className="referral-field-error">{errors.candidateState}</p>
                )}
              </div>
              <div ref={cityRef} className="relative">
                <FieldLabel htmlFor="candidateCity">Candidate&apos;s City</FieldLabel>
                <div
                  className={`relative flex items-center ${!matchedState ? "opacity-50" : ""}`}
                  onMouseEnter={() => {
                    if (!matchedState) setCityHintActive(true);
                  }}
                  onMouseLeave={() => {
                    if (!matchedState) setCityHintActive(false);
                  }}
                >
                  <input
                    id="candidateCity"
                    type="text"
                    placeholder={
                      matchedState ? "Select city" : cityHintActive ? "Select state first" : "Select city"
                    }
                    disabled={!matchedState}
                    value={cityOpen ? cityQuery : form.candidateCity}
                    onChange={(e) => {
                      if (!matchedState) return;
                      const value = e.target.value;
                      setCityQuery(value);
                      setCityOpen(true);
                      setForm((prev) => ({ ...prev, candidateCity: value }));
                      if (errors.candidateCity) setErrors((prev) => ({ ...prev, candidateCity: "" }));
                    }}
                    onFocus={() => {
                      if (!matchedState) return;
                      setCityQuery(form.candidateCity);
                      setCityOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCityOpen(false);
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={cityOpen}
                    aria-haspopup="listbox"
                    className="referral-input referral-select-input disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={!matchedState}
                    aria-label="Toggle city list"
                    onClick={() => {
                      if (!matchedState) return;
                      setCityQuery(form.candidateCity);
                      setCityOpen((open) => !open);
                    }}
                    className="referral-select-chevron disabled:cursor-not-allowed"
                  >
                    <ChevronDown />
                  </button>
                </div>
                {cityOpen && matchedState && (
                  <ul role="listbox" className="referral-options">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((c) => (
                        <li
                          key={c}
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, candidateCity: c }));
                            setCityQuery(c);
                            setErrors((prev) => ({ ...prev, candidateCity: "" }));
                            setCityOpen(false);
                          }}
                          className="referral-option"
                        >
                          {c}
                        </li>
                      ))
                    ) : (
                      <li className="referral-option-muted">No matching cities</li>
                    )}
                  </ul>
                )}
                {errors.candidateCity && (
                  <p className="referral-field-error">{errors.candidateCity}</p>
                )}
              </div>
            </div>
          </div>

          <div className="referral-form-divider" aria-hidden="true" />

          <div className="referral-form-section flex flex-col gap-4">
            <SectionHeader title="Your Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="referrerName">Your Name</FieldLabel>
                <input
                  id="referrerName"
                  name="referrerName"
                  value={form.referrerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="referral-input"
                />
                {errors.referrerName && <p className="referral-field-error">{errors.referrerName}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="referrerMobile">Your Number</FieldLabel>
                <input
                  id="referrerMobile"
                  name="referrerMobile"
                  type="tel"
                  inputMode="numeric"
                  value={form.referrerMobile}
                  onChange={handleMobileChange}
                  required
                  placeholder="Enter your contact number for payout"
                  className="referral-input"
                />
                {errors.referrerMobile && (
                  <p className="referral-field-error">{errors.referrerMobile}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-1">
            <button type="submit" className="referral-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
          </aside>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[500px] max-w-[90vw] rounded-[26px] shadow-[0_22px_60px_rgba(0,0,0,0.9)] overflow-hidden border border-[rgba(250,250,250,0.18)] bg-gradient-to-b from-[rgba(23,23,23,0.98)] via-[rgba(6,6,6,1)] to-[rgba(23,23,23,0.98)]">
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute right-5 top-5 text-2xl leading-none text-[rgba(250,250,250,0.6)] hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
            <div className="bg-gradient-to-b from-[rgba(250,250,250,0.06)] to-transparent px-10 pt-12 pb-6 flex justify-center">
              <div className="w-28 h-28 rounded-full bg-[rgba(0,0,0,0.85)] border border-[rgba(250,250,250,0.24)] shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <span className="text-5xl text-[#FACC15]">✓</span>
              </div>
            </div>
            <div className="px-10 pb-10 pt-3 text-center">
              <h2 className="text-2xl font-semibold mb-3 text-white">{popupMessage.title}</h2>
              <p className="text-[15px] text-[rgba(250,250,250,0.72)] mb-7">{popupMessage.description}</p>
              <button
                type="button"
                onClick={handleClosePopup}
                className="inline-flex items-center justify-center px-10 py-2.5 rounded-[999px] border border-[rgba(250,250,250,0.85)] bg-white/5 text-white text-sm font-medium hover:bg-white hover:text-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
