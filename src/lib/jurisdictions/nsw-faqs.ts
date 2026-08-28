import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for NSW. Answers paraphrase page facts; no HowTo. */
export const NSW_FAQS: FaqItem[] = [
  {
    question: "Do I need to notify council before selling food from home in New South Wales?",
    answer:
      "Yes. If you sell food you make at home direct to the person who eats it, you must notify your local council before you operate. If you sell to another business to on-sell, the NSW Food Authority handles notification instead. A licence may also be required for high-risk manufacture, case by case.",
  },
  {
    question: "How do I register a home kitchen for a food business in NSW?",
    answer:
      "For direct-to-consumer sales, contact your local council and complete their food business notification or permit application. Use the NSW find-your-council directory if you are unsure which council covers your premises. If you wholesale to cafes or retailers without selling direct to the final customer, notify the NSW Food Authority instead.",
  },
  {
    question: "Who regulates a home-based food business in New South Wales?",
    answer:
      "It depends how you sell. Direct to the final customer usually means your local council. Selling to a business to on-sell usually means the NSW Food Authority. The NSW Food Authority publishes statewide guidance on home-based mixed businesses; councils handle local enforcement and inspections for direct retail.",
  },
  {
    question: "Is it expensive to register a food business in NSW?",
    answer:
      "The NSW Food Authority does not publish a statewide notification fee on its home-based mixed businesses page. Councils set their own inspection and permit fees. Low-risk packaged products such as jams, chutneys, biscuits and chocolates may face a different inspection profile than sandwiches or fresh salads.",
  },
  {
    question: "What are the requirements to sell food from home in NSW?",
    answer:
      "You must notify the correct regulator before operating, comply with the Food Standards Code including labelling and allergen rules, and meet any Food Safety Supervisor or Standard 3.2.2A obligations if you handle unpackaged potentially hazardous ready-to-eat food. Your supplier name and street address in Australia or New Zealand must appear on labels.",
  },
  {
    question: "Do I need a Food Safety Supervisor for a home food business in NSW?",
    answer:
      "Only where food is ready-to-eat and potentially hazardous and not in the supplier's original packaging. If you only sell low-risk packaged foods such as jams, chutneys, biscuits or chocolates, Food Safety Supervisor and Standard 3.2.2A requirements that target unpackaged potentially hazardous ready-to-eat food typically do not apply. Confirm with your council.",
  },
  {
    question: "Can I sell at a farmers market from a home kitchen in NSW?",
    answer:
      "Direct-to-consumer sales from a home kitchen generally require council notification for the home premises. Markets may also impose their own inspection or documentation conditions. The NSW Food Authority will not inspect on request solely to satisfy some market access requirements that councils impose.",
  },
  {
    question: "Does selling at a farm gate require food business notification in NSW?",
    answer:
      "Primary food production can be excluded from the food business definition, but the Food Act excludes direct sale or service of food to the public from that primary-production carve-out. Selling produce directly from your gate can bring the sale within the Food Act and require notification with your local council.",
  },
];
