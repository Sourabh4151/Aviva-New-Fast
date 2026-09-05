import React, { useState } from "react";

const FAQ_DATA = {
  eligibility: [
    {
      question: "How do I decide if HoFF is the right program for me?",
      answer:
        "HoFF is execution-driven entrepreneurship programme specially designed for aspiring entrepreneurs, pre-revenue founders, existing business owners, family-business leaders, and professionals with a clear intent to build a business to help them grow and scale their business.",
    },
    {
      question: "Is there an age limit?",
      answer:
        "There is no age limit to apply for the program. Admission is focused on your entrepreneurial intent, business/idea, and overall fit for the program.",
    },
    {
      question:
        "Is graduation/educational qualification or GMAT/CRE score required?",
      answer:
        "There are no mandatory educational qualifications or standardised test scores required to apply for the program. The selection is solely based on your business pitch and personal interview.",
    },
    {
      question: "Is prior business experience required?",
      answer:
        "Prior work experience is not mandatory. If you are an aspiring entrepreneur or pre-revenue founder, you can apply.",
    },
    {
      question: "Can multiple co-founders apply together?",
      answer:
        "HoFF has an individual learning journey and each participant is expected to register themself individually.",
    },
  ],

  schedule: [
    {
      question: "What is the class schedule?",
      answer:
        "Live classes are conducted on Saturdays and Sundays for a total of 6 hours in the weekend format. Exact class timings will be shared with selected participants during onboarding.",
    },
    {
      question: "Are the sessions recorded if I miss a class?",
      answer:
        "Weekend classes will be held in live format. You would be expected to schedule your timings according to the class timings.",
    },
    {
      question: "How much time should I expect to spend outside class?",
      answer:
        "The program is execution-driven, so participants should expect to work on their business outside live classroom hours. This includes assignments, mentor-led implementation, business application and the Venture Capstone.",
    },
  ],

  travel: [
    {
      question: "When will the campus immersion happen?",
      answer:
        "The program includes a 5-day campus immersion. The exact dates will be communicated to selected participants as part of the programme schedule after their onboarding.",
    },
    {
      question: "Is travel and accommodation included in the program fee?",
      answer:
        "The program fees include access to mentorship, live classes, expert advisory and lifelong access to the community. The necessary arrangements for travel and accommodation during campus immersion and industry visit should be made by the participants on their own.",
    },
  ],

  others: [
    {
      question:
        "Are there financing or loan options available for the program?",
      answer:
        "Yes. Financing options are available for eligible participants. If you require financial assistance, your admission counsellor can connect you with an appropriate loan partner to explore available financing solutions.",
    },
    {
      question: "Who are the mentors?",
      answer:
        "Four sessions would be taken by Amit Jain (CEO & Co-Founder of Car Dekho Group), Dejobit Sen (CEO & Founder of Crack-ED), Vijay Vikram Singh (Bollywood actor and Voice-Artist) & Rajnish Virnani (Managing Partner). The mentor panel includes Atul Vivek, Vivek Krishna, Anurag Agarwal, Ashish Lath, Rahul Mehra, Dhairya Gangwani, Dhananjaya and Love Mendiratta.",
    },
    {
      question:
        "What would be the performance evaluation criteria for top 3 performers?",
      answer:
        "The detailed evaluation criteria would be shared with the selected participants during their onboarding.",
    },
    {
      question: "What is the cancellation policy?",
      answer: "Any fees paid towards the program is non-refundable.",
    },
  ],
};

const TABS = [
  {
    key: "eligibility",
    label: "Eligibility",
  },
  {
    key: "schedule",
    label: "Schedule & Timings",
  },
  {
    key: "travel",
    label: "Travel & Accommodation",
  },
  {
    key: "others",
    label: "Others",
  },
];

function ChevronDown({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FAQItem({ item, isOpen, onToggle, index }) {
  return (
    <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
      <button
        type="button"
        className="faq-item-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq-item-question-text">
          <span className="faq-item-number">{index + 1}.</span>{" "}
          {item.question}
        </span>

        <ChevronDown className="faq-item-chevron" />
      </button>

      {isOpen && (
        <div className="faq-item-answer">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQCategory({ tab, items, openItems, onToggle }) {
  return (
    <div className="faq-mobile-category">
      <h3 className="faq-mobile-category-title">{tab.label}</h3>

      <div className="faq-list">
        {items.map((item, index) => {
          const itemKey = `${tab.key}-${index}`;

          return (
            <FAQItem
              key={itemKey}
              item={item}
              index={index}
              isOpen={openItems[itemKey] === true}
              onToggle={() => onToggle(itemKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("eligibility");
  const [openItems, setOpenItems] = useState({});

  const currentFaqs = FAQ_DATA[activeTab] || [];

  const handleToggle = (itemKey) => {
    setOpenItems((previous) => ({
      ...previous,
      [itemKey]: !previous[itemKey],
    }));
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <h2 className="faq-heading">Frequently Asked Questions:</h2>

        {/* ================= DESKTOP ================= */}
        <div className="faq-desktop">
          <div className="faq-tabs">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={`faq-tab ${
                  activeTab === tab.key ? "faq-tab--active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  setOpenItems({});
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="faq-list">
            {currentFaqs.map((item, index) => {
              const itemKey = `${activeTab}-${index}`;

              return (
                <FAQItem
                  key={itemKey}
                  item={item}
                  index={index}
                  isOpen={openItems[itemKey] === true}
                  onToggle={() => handleToggle(itemKey)}
                />
              );
            })}
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="faq-mobile">
          {TABS.map((tab) => (
            <FAQCategory
              key={tab.key}
              tab={tab}
              items={FAQ_DATA[tab.key]}
              openItems={openItems}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}