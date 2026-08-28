import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for NT. Answers paraphrase page facts; no HowTo. */
export const NT_FAQS: FaqItem[] = [
  {
    question: "Do I need to register before selling food from home in the Northern Territory?",
    answer:
      "Yes. Food businesses must register with NT Health Environmental Health before operating when the main business is to sell food. Registration is through Territory Services, not local councils. Priority risk class drives the registration term and fee.",
  },
  {
    question: "How do I register a home kitchen for a food business in the NT?",
    answer:
      "Apply through NT Health via the Territory Services food business registration portal at nt.gov.au. NT Health assigns a Priority class (P1 to P4) based on your food and handling. Local councils handle planning and other permits but not the central food registration.",
  },
  {
    question: "Is it expensive to register a food business in the Northern Territory?",
    answer:
      "Published new-registration fees per premises are A$253 for Priority 1, A$126 for Priority 2, A$63 for Priority 3, and nil for Priority 4. Priority 1 and 2 registrations last one year; Priority 3 lasts three years.",
  },
  {
    question: "What are the requirements to sell food from home in the NT?",
    answer:
      "NT Health registration before operating, compliance with the Food Standards Code, and Food Safety Supervisor obligations under Standard 3.2.2A if you handle unpackaged potentially hazardous ready-to-eat food. Confirm your Priority class with NT Health Environmental Health.",
  },
  {
    question: "Does Priority 4 mean I can skip food business registration in the NT?",
    answer:
      "No. Priority 4 has a nil new-registration fee, but that is a fee outcome inside the registration framework, not an automatic exemption from food law. Confirm whether registration applies to your activity with NT Health Environmental Health.",
  },
  {
    question: "Who regulates a home-based food business in the Northern Territory?",
    answer:
      "NT Health Environmental Health registers food businesses territory-wide through Territory Services. Local councils may handle planning, home business approvals and market stall permits, but the food registration gate sits with NT Health.",
  },
];
