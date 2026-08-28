import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for TAS. Answers paraphrase page facts; no HowTo. */
export const TAS_FAQS: FaqItem[] = [
  {
    question: "Do I need to register before selling food from home in Tasmania?",
    answer:
      "Yes. Your local council Environmental Health Officer classifies your food business under the Tasmania Food Business Risk Classification System. Priority 1, 2 and 3 businesses must register with the local council and renew annually. Priority 3-N and Priority 4 businesses notify once.",
  },
  {
    question: "How do I register a home kitchen for a food business in Tasmania?",
    answer:
      "Contact your local council Environmental Health Officer before operating. The EHO assigns a Priority risk class (P1, P2, P3, P3-N or P4) based on your food and how you handle it. Higher-risk classes register annually; lower-risk classes use a one-off notification.",
  },
  {
    question: "Is it expensive to register a food business in Tasmania?",
    answer:
      "Fees are set by each local council. Tasmania does not publish a statewide registration fee. Confirm the fee for your assigned Priority class with your council before you open.",
  },
  {
    question: "What are the requirements to sell food from home in Tasmania?",
    answer:
      "Council risk classification, registration or one-off notification, compliance with the Food Standards Code, and Food Safety Supervisor obligations under Standard 3.2.2A if you handle unpackaged potentially hazardous ready-to-eat food. Confirm your Priority class with the local EHO before relying on a one-off notification path.",
  },
  {
    question: "Does a low-risk home seller only need a one-off notification in Tasmania?",
    answer:
      "Only if your council assigns Priority 3-N or Priority 4. Priority 1, 2 and 3 businesses register and renew annually. Do not assume every small home or farm-gate seller qualifies for the one-off notification path.",
  },
  {
    question: "Who regulates a home-based food business in Tasmania?",
    answer:
      "Your local council Environmental Health Officer handles classification, registration and notification. The Tasmanian Department of Health provides statewide guidance. Risk class, not geography alone, determines whether you register annually or notify once.",
  },
];
