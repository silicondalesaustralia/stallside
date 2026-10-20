import type { KnowledgeArticle } from "./types";

export const gstArticles: KnowledgeArticle[] = [
  {
    slug: "enable-gst",
    title: "Turn on GST (Australian sellers only)",
    summary:
      "If your business is registered for GST in Australia, Vendl records the GST in each sale so your order exports are ready for your BAS. Not available outside Australia.",
    videoUrl: null,
    omitVideo: true,
    related: ["export-orders", "payments-overview"],
    ctas: [
      { label: "GST settings", href: "/dashboard/settings" },
      { label: "Products", href: "/dashboard/products" },
    ],
    steps: [
      "GST settings only appear for Australian accounts selling in AUD. Only turn GST on if your business is registered for GST with the ATO.",
      "First, mark your GST-free products. Open each product, find the GST card and tick GST-free item. Fresh fruit and veg, eggs, meat and plain bread are usually GST-free; cakes, biscuits, flowers and most prepared food usually include GST. Check with your accountant if you're unsure.",
      "Next, open Settings and find the GST (Australia only) section. Enter your 11-digit ABN, tick Registered for GST (prices include GST) and tap Save.",
      "Your prices stay the same. Australian prices must include GST, so Vendl works out the GST inside each price (1/11 of the price of taxable items, after any discount).",
      "From now on every new order records its GST automatically, including card, Square, cash, PayID, pre-order and subscription sales.",
      "To add GST to orders you took before turning it on, tap Sync in the GST section. Vendl recalculates GST on all your past orders using your current product settings.",
      "Changed a product to or from GST-free later? Tap Sync again so past orders match.",
      "No longer registered for GST? Untick Registered for GST, save, then tap Sync to set GST on past orders back to zero.",
    ],
  },
  {
    slug: "export-orders",
    title: "Export orders for your accountant",
    summary:
      "Download your orders as a spreadsheet with totals, GST, Vendl fees, card processing fees and what you received.",
    videoUrl: null,
    omitVideo: true,
    related: ["enable-gst", "payments-overview"],
    ctas: [{ label: "Orders", href: "/dashboard/orders" }],
    steps: [
      "Open Orders and pick a date range - Today through 12 months, All time, or Custom for a quarter or financial year.",
      "Under Export this range, tap Orders CSV for one row per order: payment method and provider, subtotal, discount, total, GST, Vendl fee, card processing fee (Stripe, Square or PayPal), GST on that fee, and net to you.",
      "Tap Line items CSV for one row per product sold, with quantity, price, whether it was GST-free and its GST. Handy for seeing what sold best.",
      "Exports include paid and confirmed orders by default. Tick Include unpaid, abandoned and refunded to see every order.",
      "Card processing fees appear once the payment provider reports them, usually within an hour of the sale.",
      "For your BAS, the GST column is the GST collected on sales and GST on processor fee is the GST you paid on Stripe or Square fees. Your accountant can take it from there.",
      "Files open in Excel, Numbers or Google Sheets.",
    ],
  },
];
