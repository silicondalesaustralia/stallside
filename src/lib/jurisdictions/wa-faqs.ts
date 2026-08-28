import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for WA. Answers paraphrase page facts; no HowTo. */
export const WA_FAQS: FaqItem[] = [
  {
    question: "Do I need to register before selling food from home in Western Australia?",
    answer:
      "Yes. Food prepared in a residential home intended for sale is a food business under the Food Act 2008 (WA). You must register or notify with your local government Environmental Health Services before you operate. Some exempt activities under the Food Regulations 2009 notify instead of registering.",
  },
  {
    question: "How do I register a home kitchen for a food business in WA?",
    answer:
      "Contact the Environmental Health Services team at your local government before setting up. Home-prepared food for sale generally requires registration, not an informal notify-only path. Your council will advise whether your activity registers or notifies under the regulations.",
  },
  {
    question: "Is it expensive to register a food business in Western Australia?",
    answer:
      "Local governments set their own fees. The WA Department of Health publishes prescribed fees only for DoH-regulated sites: notification A$84 and registration A$255 under the Food Regulations 2009. Council fees for home businesses are set locally and are not published statewide.",
  },
  {
    question: "What are the requirements to sell food from home in WA?",
    answer:
      "Registration or notification with local government, compliance with the Food Standards Code including labelling, and Food Safety Supervisor obligations under Standard 3.2.2A if you handle unpackaged potentially hazardous ready-to-eat food. Home kitchen use is framed for low-risk activity under Standard 3.2.3.",
  },
  {
    question: "What is the penalty for operating an unregistered food business in WA?",
    answer:
      "Under the Food Act 2008 (WA), maximum penalties for an unregistered food business are A$10,000 for an individual and A$50,000 for a body corporate.",
  },
  {
    question: "Does a charity bake sale need registration in Western Australia?",
    answer:
      "Charitable fundraising can be exempt from registration for non-potentially hazardous food cooked for immediate consumption, but notification is still required. Confirm your product and event with your local Environmental Health Services team.",
  },
  {
    question: "Can I sell at a farm gate from a home kitchen in WA?",
    answer:
      "Direct-to-consumer sales from a home premises generally require registration with the local government where the premises sits. Confirm product risk and sales method with your Environmental Health Officer before opening.",
  },
];
