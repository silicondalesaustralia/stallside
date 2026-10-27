import type { KnowledgeArticle } from "./types";

export const upsellArticles: KnowledgeArticle[] = [
  {
    slug: "upsells",
    title: "Cart upsells and pre-order add-ons",
    summary:
      "Offer one extra item in shop carts, or a page-level add-on on a pre-order page.",
    keywords: ["upsell", "add-on", "cross sell", "offer", "cart"],
    related: ["first-order-discount", "pre-order-pages", "volume-prices"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Open your business (Business switcher → Manage) and choose the Upsells tab.",
      "Under Stall cart upsell, pick a Product to offer and an optional Special upsell price, then tap Save upsells.",
      "To offer something different with a particular product, open that product and set Cart upsell (take-now). It overrides the business default.",
      "Shoppers see Get this right now at a discount in their cart and can tap Add to cart.",
      "For pre-orders, edit a pre-order page and fill in Pre-order add-on (name, price and optional percent or amount off). It uses the same collection day and payment settings as the page.",
      "Under Scarcity, tick Show “Only N left” when stock is low to nudge shoppers.",
    ],
    tips: [
      "The upsell is hidden when the offered product is sold out or already in the cart.",
      "Products marked Available for pre-order pages can't have their own cart upsell.",
    ],
  },
  {
    slug: "first-order-discount",
    title: "First-order discount",
    summary: "Give new customers a percent or dollar discount on their first order.",
    keywords: ["discount", "coupon", "new customer", "welcome", "promo", "percent off"],
    related: ["upsells", "qr-signs", "volume-prices"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Open your business and choose the Upsells tab.",
      "Under First-order discount, tick Enable first-order discount.",
      "Set Percent off (for example 10), or a fixed amount instead. A fixed amount wins over the percent if you set both.",
      "Tap Save upsells.",
      "At checkout, Vendl checks the shopper's email. If they've never had a paid order at this business, the discount applies.",
      "Tick First-order offer on your QR sign to print First time? Get X off.",
    ],
    tips: ["The discount doesn't apply when the cart uses a volume price."],
  },
];
