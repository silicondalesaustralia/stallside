import type { KnowledgeArticle } from "./types";

export const preOrderArticles: KnowledgeArticle[] = [
  {
    slug: "pre-orders",
    title: "Pre-orders overview",
    summary:
      "Take orders ahead of a collection or delivery day: shoppers pay by card (in full or a deposit) or pay you at pickup, then you make, pack and hand over.",
    keywords: ["pre-order", "preorder", "order ahead", "deposit", "pay at pickup", "cash on pickup", "bake day", "market day"],
    related: ["pre-order-pages", "collections-day", "square-subscriptions", "email-customers"],
    ctas: [{ label: "Pre-order pages", href: "/dashboard/pre-order-pages" }],
    steps: [
      "Choose how customers pay on each page: Pay in full now or Deposit (card, needs Stripe or Square), or Pay at pickup (no card setup needed).",
      "You sell pre-orders from a pre-order page: one link and QR per collection or delivery day, with its own order window.",
      "Each page has an Orders close time, a Collection time, Collect or Deliver, and how customers pay.",
      "Shoppers enter their name, email and optional phone (and address if you deliver), then pay by card. On Pay at pickup pages they tap Place order, pay at pickup instead.",
      "They get a confirmation email and you get a Pre-order alert.",
      "Open Pick Ups & Delivery to see what to make, pack each order, print labels and email buyers.",
    ],
    tips: [
      "Take-now items and pre-order items can't share a checkout. Items from different collection days, or with different payment or delivery settings, also need separate checkouts.",
      "Pay at pickup orders aren't paid online, so a no-show costs you the stock. Use it for customers you know, or take a Deposit instead.",
      "With a deposit, the balance is charged automatically to the same card after the collection time. If it fails, Vendl retries up to 3 times, then cancels the order and releases the stock.",
    ],
  },
  {
    slug: "pre-order-pages",
    title: "Create a pre-order page",
    summary:
      "Build a page for one collection or delivery day with an order window, card payment, deposit or pay at pickup, an optional add-on, and its own link and QR.",
    keywords: ["pre-order page", "order window", "collection day", "deposit", "pay at pickup", "qr", "link"],
    related: ["pre-orders", "collections-day", "upsells", "product-options"],
    ctas: [{ label: "New pre-order page", href: "/dashboard/pre-order-pages/new" }],
    steps: [
      "To take payment or a deposit when customers order, connect Stripe or Square first. Without them, the page uses Pay at pickup.",
      "On each product you want to sell, tick Available for pre-order pages and save.",
      "Open Pre-order pages and tap + New pre-order page. Under Link preview, enter a Page title, and optionally a Description and Share photo.",
      "Set Orders close and Collection (after orders close). Add your Suburb / location and a note for buyers.",
      "Choose Handover: Collect or Deliver. Under How do customers pay?, choose Pay in full now, Deposit with the percent paid now (default 30%), or Pay at pickup (Collect only).",
      "Pick the products for this page. Optionally add a Pre-order add-on with a name, price and discount.",
      "Keep Page is live ticked and tap Create page. Use Open to test it and Print QR for a poster, or share the link online.",
    ],
    tips: [
      "Hide on business page is ticked by default, so these products only sell through this page's link and QR.",
      "Saving a page copies its order window, payment option and handover onto its products. If a product is on two pages, the last saved page's settings win.",
      "The Suburb / location you enter here also updates your business's location.",
      "If you connected Square before deposits were available, reconnect Square once so it can save shoppers' cards.",
    ],
  },
  {
    slug: "collections-day",
    title: "Pick Ups & Delivery: make, pack and hand over",
    summary:
      "See what to make for each pre-order page or subscription, pack by customer, print labels, and mark orders collected.",
    keywords: ["collections", "packing", "make list", "labels", "ready", "collected", "avery"],
    related: ["pre-orders", "pre-order-pages", "email-customers", "subscriptions"],
    ctas: [{ label: "Pick Ups & Delivery", href: "/dashboard/collections" }],
    steps: [
      "Open Pick Ups & Delivery (Collect on your phone). There's a row for each pre-order page and each subscription with paid orders, showing orders, items, money taken and how many are handed over.",
      "Tap a row. The Make list shows totals by product and option, plus delivery counts by suburb.",
      "In the Packing list, check each order's name, phone, items, note and pick up or delivery address. Tap the order number to open the full order.",
      "Tap Mark ready when it's packed, then Mark collected when it's handed over or delivered. For Pay at pickup orders the button says Paid & collected and also marks the order paid.",
      "To print, choose a Label sheet (Avery L7163, L7160, L7162 or A4 cards), tick Include business name and logo if you like, then Print list or Print labels at 100% scale.",
      "Tap Email all (N) to message everyone on that page, or tap one email to message a single buyer.",
    ],
    tips: [
      "Deposit orders show Balance pending and Hold until paid until the balance is paid, which happens after the collection time. Hold handover until then.",
      "Pay at pickup orders show Pay at pickup with the amount due until you tap Paid & collected, or Mark paid on the order.",
      "Pick Ups & Delivery shows upcoming orders and the last 14 days. Older orders are in Orders.",
    ],
  },
];
