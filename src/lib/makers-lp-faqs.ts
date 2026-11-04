import type { FaqItem } from "@/lib/schema";
import { formatMoney } from "@/lib/money";
import { CARD_PLAN_BY_CURRENCY } from "@/lib/saas-pricing";

const proPrices = (["AUD", "USD", "GBP", "EUR"] as const)
  .map((c) => formatMoney(CARD_PLAN_BY_CURRENCY[c], c))
  .join(" / ");

/** Home page FAQ; also feeds the FAQPage structured data. */
export const HOME_FAQS: FaqItem[] = [
  {
    question: "Is Vendl just for food businesses?",
    answer:
      "No. Vendl is for people who make products from ingredients, materials or parts, as well as growers and farm shops. That includes soap, candles, jewellery, woodwork and 3D-printed products.",
  },
  {
    question: "Do I need to build a website to start?",
    answer:
      "No. Free includes a shop link you can share. Pro adds the website builder and custom domain connection when you want your own full website.",
  },
  {
    question: "Can I import my existing products?",
    answer:
      "Yes, with Pro. Import products (with stock) and customers from Shopify, Wix, WooCommerce, Squarespace, Square or any spreadsheet, mapping your columns as you go. Pages, subscriptions and website designs don't transfer, so review your catalogue after importing.",
  },
  {
    question: "Can I keep my current website?",
    answer:
      "Yes. You can keep your website and share links to your Vendl shop or selling pages. You can build a Vendl website later if you choose.",
  },
  {
    question: "Is the community included on Free?",
    answer:
      "Yes. Both Free and Pro members get access to the maker community for learning, questions and sharing ideas.",
  },
  {
    question: "How do payments work?",
    answer:
      "Connect Stripe or Square, or PayPal on Pro. Customers can pay by card, Apple Pay, Google Pay, pay-later and local methods such as PayID, with cash for in-person sales. Available methods depend on your region. Free has a 2.5% Vendl fee on card, Tap & Go and pay-later payments; Pro has none. Your provider's processing fees apply on both plans.",
  },
  {
    question: "How much does Vendl Pro cost?",
    answer: `Vendl Pro is ${proPrices} a month and removes the Vendl transaction fee. Free stays $0 a month. Domain purchases cost extra.`,
  },
  {
    question: "Can I run more than one business?",
    answer:
      "Each Vendl account runs one business, with its own shop, products, customers and payment settings.",
  },
];
