import type { VerticalConfig } from "./types";

export type { VerticalConfig, StarterCatalogueItem } from "./types";

export const VERTICALS: Record<string, VerticalConfig> = {
  bakers: {
    slug: "bakers",
    displayName: "Bakers",
    productNoun: "bake",
    collectionNoun: "Collection day",
    windowNoun: "Order window",
    defaultDepositPct: null,
    defaultPaymentTiming: "PAY_UPFRONT",
    defaultHandover: "COLLECT",
    defaultLeadDays: 3,
    starterCatalogue: [
      { name: "Sourdough loaf", priceCents: 1200, stockQuantity: 20 },
      { name: "Chocolate chip cookies (6)", priceCents: 1500, stockQuantity: 24 },
      { name: "Focaccia", priceCents: 1000, stockQuantity: 15 },
    ],
    posterHeadline: "Order fresh bakes",
    hook: "The simplest way to take pre-orders and get paid - for any bake, not just bread.",
    supporting:
      "Loaves, pastries, cookies, cakes - know what to bake before you bake it. Get paid before collection day.",
    faq: [
      {
        q: "Do I need a website?",
        a: "No. Share a link or print a QR - buyers order and pay online.",
      },
      {
        q: "When do I get paid?",
        a: "Card payment is taken when they order. Money goes to your Stripe account.",
      },
      {
        q: "How do I know what to bake?",
        a: "Open Collections for a make list by day - totals per item, then packing by customer.",
      },
      {
        q: "Is it only for bread?",
        a: "No. Any baked good - loaves, pastries, cookies, cakes, boxes - with caps and a make list.",
      },
    ],
  },
  "farm-stalls": {
    slug: "farm-stalls",
    displayName: "Farm stalls",
    productNoun: "box",
    collectionNoun: "Collection day",
    windowNoun: "Order window",
    defaultDepositPct: null,
    defaultPaymentTiming: "PAY_UPFRONT",
    defaultHandover: "COLLECT",
    defaultLeadDays: 2,
    starterCatalogue: [
      { name: "Dozen eggs", priceCents: 800, stockQuantity: 30 },
      { name: "Seasonal veg box", priceCents: 3500, stockQuantity: 12 },
      { name: "Honey 500g", priceCents: 1500, stockQuantity: 20 },
    ],
    posterHeadline: "Order for collection",
    hook: "The simplest way to take pre-orders and get paid - before market day or a restock.",
    supporting:
      "Sell ahead of a market day or restock. Buyers pay before they collect.",
    faq: [
      {
        q: "Can I still run an honesty stall?",
        a: "Yes. Pre-orders sit alongside take-now QR checkout on the same stand.",
      },
      {
        q: "Do buyers need an account?",
        a: "No. Name and email at checkout is enough.",
      },
      {
        q: "What if I sell out early?",
        a: "The order window closes when the cap is hit. You see who is collecting what by day.",
      },
    ],
  },
  firewood: {
    slug: "firewood",
    displayName: "Firewood & bulk loads",
    productNoun: "load",
    collectionNoun: "Delivery day",
    windowNoun: "Order window",
    defaultDepositPct: 30,
    defaultPaymentTiming: "DEPOSIT_THEN_BALANCE",
    defaultHandover: "DELIVER",
    defaultLeadDays: 21,
    starterCatalogue: [
      { name: "Mixed hardwood 1m³", priceCents: 18000, stockQuantity: 10 },
      { name: "Redgum 1m³", priceCents: 22000, stockQuantity: 8 },
      { name: "Kindling bag", priceCents: 1500, stockQuantity: 40 },
    ],
    posterHeadline: "Order your winter wood",
    hook: "The simplest way to take pre-orders and get paid - deposits, delivery, route totals.",
    supporting:
      "Take a deposit now, charge the balance before delivery. One make list for the route.",
    faq: [
      {
        q: "How do deposits work?",
        a: "Buyers pay a deposit (default 30%) when they order. The balance is charged from their saved card before delivery.",
      },
      {
        q: "Do I deliver or do they collect?",
        a: "Delivery is the default for firewood - buyers enter an address. You can switch products to collection if you prefer.",
      },
      {
        q: "What if the balance charge fails?",
        a: "Vendl retries and emails the buyer a link. The load stays on hold until the balance clears.",
      },
    ],
  },
};

export const PRE_ORDER_VERTICAL_SLUGS = [
  "bakers",
  "farm-stalls",
  "firewood",
] as const;

export type PreOrderVerticalSlug = (typeof PRE_ORDER_VERTICAL_SLUGS)[number];

export function getVertical(slug: string | null | undefined): VerticalConfig | null {
  if (!slug) return null;
  return VERTICALS[slug] ?? null;
}

export function listPreOrderVerticals(): VerticalConfig[] {
  return PRE_ORDER_VERTICAL_SLUGS.map((s) => VERTICALS[s]);
}
