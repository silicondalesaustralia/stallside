import type { FaqItem } from "@/lib/schema";

/** Query-shaped FAQs for Missouri cottage food. Answers paraphrase page facts; no HowTo. */
export const MO_FAQS: FaqItem[] = [
  {
    question: "Do I need a permit to sell cottage food from home in Missouri?",
    answer:
      "No. Under RSMo 196.298, a qualifying cottage food production operation is not a food service establishment and is not subject to a cottage food permit or routine local health inspection. Local health departments may not regulate cottage food production under this section. Separate business licensing or tax registration may still apply outside the food statute.",
  },
  {
    question: "What foods can I sell under Missouri cottage food law?",
    answer:
      "Only three categories: baked goods that are not potentially hazardous, canned jam or jelly, and dried herb or herb mix. The product list is closed. Salsa, pickles, freeze-dried foods, cream pies, meats, dairy, eggs and pet foods are examples DHSS lists as outside the cottage food statute.",
  },
  {
    question: "Is there a sales cap for Missouri cottage food?",
    answer:
      "There is no annual gross sales cap in the current RSMo 196.298 cottage food statute. The former US$50,000 cap was removed effective 28 August 2022. Do not confuse that with RSMo 261.241, a separate jam, jelly and honey domicile exemption that still carries a US$30,000 annual gross sales limit.",
  },
  {
    question: "Can I sell cottage food online in Missouri?",
    answer:
      "Yes, but only when both the cottage food production operation and the purchaser are located in Missouri. Cross-border internet sales are not allowed under RSMo 196.298(5). Cottage food must also be sold only directly to consumers, not wholesale.",
  },
  {
    question: "Can I sell cottage food at a farmers market in Missouri?",
    answer:
      "RSMo 196.298 does not name farmers markets, roadside stands or festivals as cottage food venues. The statutory definition ties the operation to producing listed foods for sale at the individual's home. A separate Missouri Food Code non-potentially hazardous stand exemption may apply where local codes allow. Ask your local public health agency which pathway applies before treating a market stall as covered.",
  },
  {
    question: "What label is required on Missouri cottage food?",
    answer:
      "RSMo 196.298(4) requires the name and address of the cottage food production operation and a statement that the food is not inspected by the department or local health department. DHSS guidance also expects the common name of the food, ingredients in descending order by weight, net weight, allergens, and a statement that the product is prepared in a kitchen not subject to DHSS inspection.",
  },
  {
    question: "Who regulates homemade food that is not cottage food in Missouri?",
    answer:
      "Once you leave RSMo 196.298, local public health agencies regulate retail food establishments under the Missouri Food Code or local ordinances. DHSS also runs Manufactured Foods for wholesale products. RSMo 261.241 covers a separate jam, jelly and honey domicile exemption with a US$30,000 cap.",
  },
  {
    question: "Does my local health department inspect Missouri cottage food kitchens?",
    answer:
      "Local health departments may not regulate the production of food at a cottage food production operation under RSMo 196.298. DHSS and local agencies must maintain complaint records and retain authority to investigate foodborne disease or outbreaks. That bar applies to qualifying cottage food production, not every homemade food sold in Missouri.",
  },
];
