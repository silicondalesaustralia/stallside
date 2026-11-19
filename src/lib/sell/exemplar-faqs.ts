type Faq = { question: string; answer: string; evidenceIds: string[] };

function faq(question: string, answer: string): Faq {
  return { question, answer, evidenceIds: [] };
}

export const CANDLE_FAQS: Faq[] = [
  faq(
    "Can I calculate the cost of each candle size?",
    "Yes. Enter batch materials, labour and overheads, set saleable yield for that size, then add packaging per candle. Recalculate when jar size or yield changes.",
  ),
  faq(
    "Can I sell different scents and sizes?",
    "Yes. Create products or options for scent and size. Keep each variant’s materials clear so costing stays accurate.",
  ),
  faq(
    "Can I accept pre-orders for a new collection?",
    "Yes. Open a pre-order for a scent release, take payment, then fulfil when that batch is ready.",
  ),
  faq(
    "Can I sell at markets as well as online?",
    "Yes. Use QR checkout for stall sales alongside your online shop link or website.",
  ),
  faq(
    "What should I check before shipping candles to customers?",
    "Vendl helps you take and fulfil orders. Packaging, carrier rules and destination restrictions are your decisions — check local guidance before you ship.",
  ),
];

export const COOKIE_FAQS: Faq[] = [
  faq(
    "How do I open orders for a cookie collection day?",
    "Use a pre-order with a clear flavour cut-off. Customers order online; you bake and pack against that list.",
  ),
  faq(
    "How do I price a bag when one batch makes many cookies?",
    "Cost the dough and labour for cookies produced, divide by saleable bags (cookies ÷ cookies per bag), then add packaging per bag.",
  ),
  faq(
    "How do I stop taking more orders than I can fulfil?",
    "Set available bag quantities or close the order window when oven capacity is reached.",
  ),
];

export const SIGN_FAQS: Faq[] = [
  faq(
    "What choices can customers submit?",
    "Use product options and order details for names, sizes or themes you support. Do not invent a design-approval portal.",
  ),
  faq(
    "How do I price setup plus each sign?",
    "Include setup labour once per order or allocate it across the run, then add wood, lettering and packaging per sign.",
  ),
  faq(
    "How are lead times handled?",
    "State lead times on the product page and fulfil within what you can deliver. Deposits only where your checkout supports them.",
  ),
];

export function exemplarFaqs(slug: string): Faq[] | null {
  if (slug === "candles") return CANDLE_FAQS;
  if (slug === "cookies") return COOKIE_FAQS;
  if (slug === "wooden-signs") return SIGN_FAQS;
  return null;
}
