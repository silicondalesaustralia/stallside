import type { FaqItem } from "@/lib/schema";

/** Real query-shaped FAQs for SA. Answers paraphrase page facts; no HowTo. */
export const SA_FAQS: FaqItem[] = [
  {
    question: "Do I need to notify council before selling food from home in South Australia?",
    answer:
      "Yes. In South Australia you must notify the relevant enforcement agency before you start operating a home-based food business. For most people that means your local council. The Food Business Notification itself has no fee, but failing to notify carries a maximum penalty of A$25,000 for an individual under section 86 of the Food Act 2001 (SA).",
  },
  {
    question: "Who regulates a home-based food business in South Australia?",
    answer:
      "For most home food businesses, your local council is the enforcement agency. SA Health's Food Safety and Regulation Branch provides statewide guidance, while councils handle local enforcement and inspections. Geography usually determines which council handles your notification.",
  },
  {
    question: "Does a one-off stall or charity sale count as a food business in South Australia?",
    answer:
      "Yes. Under the Food Act 2001 (SA), a food business can involve handling or sale of food on one occasion only, and charitable or community activity can still be a food business. SA Health guidance says requesting a donation in exchange for food can constitute selling food.",
  },
  {
    question: "If I grow my own produce, do I still need to notify for farm-gate sales?",
    answer:
      "Growing food can be primary production, which is generally excluded from the food-business definition. The Food Act excludes direct sale or service of food to the public from that primary-production definition, so selling produce directly from your gate can bring the sale within the Food Act and require notification.",
  },
  {
    question: "Do egg sellers need more than council Food Business Notification in South Australia?",
    answer:
      "Yes. Egg production is separately regulated by PIRSA. Accreditation is required if you have more than 50 laying birds, and regardless of flock size if you sell eggs to another food business, another egg producer, at a market, or by wholesale. PIRSA publishes an accreditation application fee of A$606 plus an annual fee based on flock size.",
  },
  {
    question: "Do I need a Food Safety Supervisor for a simple farm stand in South Australia?",
    answer:
      "Standard 3.2.2A Food Safety Supervisor requirements apply to Category 1 and Category 2 businesses handling unpackaged, potentially hazardous ready-to-eat food. A stand selling whole fruit and vegetables, sealed jam, honey or other low-risk products is typically not the same activity. The dividing line is the food and how you handle it, not whether you call it a farm stand.",
  },
  {
    question: "What is the penalty for not notifying a food business in South Australia?",
    answer:
      "Under section 86 of the Food Act 2001 (SA), the maximum penalties are A$25,000 for an individual and A$120,000 for a body corporate. Published expiation fees are A$300 for an individual and A$1,500 for a body corporate. The notification application fee itself is nil.",
  },
  {
    question: "Is an honesty box or unattended stall exempt from South Australian food law?",
    answer:
      "No. There is no special honesty-box exemption. An unattended stand selling food is still a method of selling food. If payment is requested through an honesty box, QR code or electronic checkout, you are still conducting a sale and food-safety obligations still apply.",
  },
];
