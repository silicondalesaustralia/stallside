import type { MarketSeed, SellVariant } from "./types";
import { exemplarFaqs } from "./exemplar-faqs";

type Faq = { question: string; answer: string; evidenceIds: string[] };

function faq(question: string, answer: string): Faq {
  return { question, answer, evidenceIds: [] };
}

export function nicheFaqs(seed: MarketSeed): Faq[] {
  const tailored = exemplarFaqs(seed.slug);
  if (tailored) return tailored;

  const unit = seed.saleUnit;
  const product = seed.label.toLowerCase();
  const example = seed.exampleProduct.toLowerCase();
  const byVariant: Record<SellVariant, Faq[]> = {
    fresh: [
      faq(
        `How do I open orders for a ${product} collection day?`,
        `Use a pre-order or stock listing with a clear cut-off. Customers order online; you fulfil against your planned batch for ${example}.`,
      ),
      faq(
        `How do I price a ${unit} from one batch?`,
        `Add batch inputs, divide by saleable ${unit}s, then add packaging. The calculator walks through that for ${example}.`,
      ),
      faq(
        "How do I stop taking more orders than I can fulfil?",
        "Set available quantities or close the order window when capacity is reached.",
      ),
    ],
    batch: [
      faq(
        `How do different pack sizes affect ${product} cost?`,
        "Larger packs change packaging and saleable yield. Recalculate whenever pack size or batch yield changes.",
      ),
      faq(
        `Can I sell variants of ${product}?`,
        "Yes — create products or options for scent, flavour or size. Keep each variant's materials clear for costing.",
      ),
      faq(
        "How do I tell customers when a batch is available?",
        "Publish when ready, or open a pre-order for the next release. Restock alerts help repeat buyers return.",
      ),
    ],
    labour: [
      faq(
        "How do I include my making time?",
        `Add labour as a batch or per-piece input. For ${example}, time is often the largest cost to undercount.`,
      ),
      faq(
        "Can I sell ready-made and made-to-order products?",
        "List finished stock with quantities, and use order notes or options for made-to-order pieces.",
      ),
      faq(
        "How do sizes or components affect price?",
        "Reflect size-related materials and labour in each product or option so larger pieces are not underpriced.",
      ),
    ],
    machine: [
      faq(
        "How do I account for material waste?",
        "Use saleable yield after rejects or nesting loss, then add packaging per finished unit.",
      ),
      faq(
        "How do I separate machine overhead from labour?",
        "Enter machine allocation and active finishing labour as separate inputs.",
      ),
      faq(
        "What order details can customers select?",
        "Offer verified size, colour or finish options. Do not promise file-upload or proof workflows Vendl does not provide.",
      ),
    ],
    unique: [
      faq(
        "How do I sell an item with only one available?",
        "Set stock to one. When it sells, the listing shows sold out until you add another piece.",
      ),
      faq(
        "How do I price a one-off piece?",
        `Allocate materials, studio time and packaging to that single ${unit}.`,
      ),
      faq(
        "Can customers collect instead of shipping?",
        "Yes — offer collection where you fulfil locally and state pickup details on the product.",
      ),
    ],
    personalized: [
      faq(
        "What choices can customers submit?",
        "Use product options and order details for names, sizes or themes you support. Do not invent a design-approval portal.",
      ),
      faq(
        "How do I price setup plus units?",
        "Include setup labour once per order or allocate it across the suite, then add per-unit materials and packaging.",
      ),
      faq(
        "How are lead times handled?",
        "State lead times on the product page and fulfil within what you can deliver.",
      ),
    ],
  };
  return byVariant[seed.variant];
}

export const SHARED_FAQS: Faq[] = [
  faq(
    "Can I start selling without building a full website?",
    "Yes. Free includes a shop link for products and orders. Pro adds a full website, custom domain and production costing tools.",
  ),
  faq(
    "What does Vendl cost, including transaction fees?",
    "Start free with a shop link. Pro unlocks website, costing and email tools. Card processing fees apply separately; Free may include a Vendl transaction fee — check current pricing.",
  ),
];
