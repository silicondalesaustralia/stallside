import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for VIC. Answers paraphrase page facts; no HowTo. */
export const VIC_FAQS: FaqItem[] = [
  {
    question: "Do I need to register before selling food from home in Victoria?",
    answer:
      "Yes. You must register with or notify your local council before you run a home-based food business. Your council classifies the premises by highest-risk food activity under classes 1, 2, 3, 3A or 4. Classes 1, 2, 3 and 3A register annually; class 4 notifies once.",
  },
  {
    question: "How do I register a home kitchen for a food business in Victoria?",
    answer:
      "Contact your local council Environmental Health Officer early and apply through FoodTrader at foodtrader.vic.gov.au. Fixed premises register with the council where the premises sits. Temporary or mobile traders register with a principal council and lodge a statement of trade when trading elsewhere.",
  },
  {
    question: "Is a home kitchen class 3 or class 4 in Victoria?",
    answer:
      "It depends on the food and how you handle it. Class 4 is the lowest risk and uses a one-off notification. Many home sellers of jam, biscuits or similar packaged low-risk foods may be class 3, which requires annual registration. Your council EHO assigns the class based on your highest-risk activity.",
  },
  {
    question: "Is it expensive to register a food business in Victoria?",
    answer:
      "Fees are set by each council and vary by class. Victoria does not publish a single statewide registration fee. Community class-4 temporary notifications are not charged under community guidance, but commercial home businesses should confirm fees with their council before operating.",
  },
  {
    question: "What are the requirements to sell food from home in Victoria?",
    answer:
      "Council classification, registration or notification via FoodTrader, compliance with the Food Standards Code, and a Food Safety Supervisor for class 1, 2 and 3A premises. Class 1 and some class 2 businesses also need a food safety program. Contact your council before committing to a home kitchen setup.",
  },
  {
    question: "Do I need a Food Safety Supervisor for a home food business in Victoria?",
    answer:
      "Required for class 1, 2 and 3A premises. Not required by law for class 3 or class 4. Free food handler training through DoFoodSafely is accepted for basic food handler skills.",
  },
  {
    question: "Can I sell at a farmers market from a home kitchen in Victoria?",
    answer:
      "Yes, with the correct registration or notification and, for temporary or mobile trading, a statement of trade to the council where you are trading. Community gold-coin donation or free food events may fall under separate community guidance; confirm whether your stall is commercial.",
  },
];
