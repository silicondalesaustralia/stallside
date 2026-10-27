import type { KnowledgeArticle } from "./types";

export const gstArticles: KnowledgeArticle[] = [
  {
    slug: "enable-gst",
    title: "Set up GST, VAT or sales tax",
    summary:
      "Tell Vendl where you trade and whether you're registered. GST and VAT are worked out inside your prices; US and Canadian sales tax is added at checkout.",
    keywords: ["gst", "vat", "sales tax", "abn", "bas", "tax", "gst-free", "zero-rated", "ato", "hmrc", "ird"],
    related: ["export-orders", "payments-overview"],
    ctas: [
      { label: "Tax settings", href: "/dashboard/settings/tax" },
      { label: "Products", href: "/dashboard/products" },
    ],
    steps: [
      "Open Settings, then Tax. Choose your country. Australia and New Zealand use GST, the UK, Ireland and EU countries use VAT, and the US and Canada use sales tax.",
      "Only turn tax on if you're registered with your tax office. Enter your tax ID (ABN, GST number, VAT number or sales tax permit), tick Registered and tap Save.",
      "GST and VAT countries: your prices already include tax, so they stay the same. Vendl works out the tax inside each price (1/11 at 10% GST, 1/6 at 20% VAT), after any discount.",
      "US and Canada: enter your combined state and local (or provincial) rate, such as 8.25. Shoppers see the sales tax added to their cart total.",
      "Mark tax-free or zero-rated products on each product's page. The Tax page lists every product you've marked.",
      "Charge tax on delivery? Tick the delivery option on the Tax page. In GST and VAT countries the tax sits inside your delivery fee; in the US and Canada it's added on top.",
      "Customer receipts show the tax on each order, with your tax ID.",
    ],
    tips: [
      "Fresh fruit and veg, eggs and plain bread are often tax-free. Check with your accountant if you're unsure.",
      "Subscriptions renew at a fixed price, so in the US and Canada include sales tax in that price.",
      "GST and VAT countries: to add tax to orders taken before you turned it on, or after changing tax-free products, tap Sync on the Tax page. Untick Registered and Sync to set past orders back to zero.",
    ],
  },
  {
    slug: "export-orders",
    title: "Export orders for your accountant",
    summary:
      "Download your orders as a spreadsheet with totals, tax, Vendl fees, card processing fees and what you received.",
    keywords: ["export", "csv", "spreadsheet", "accountant", "bas", "excel", "report", "fees", "vat"],
    related: ["enable-gst", "manage-orders", "production-profit"],
    ctas: [{ label: "Orders", href: "/dashboard/orders" }],
    steps: [
      "Open Orders and pick a date range: Today through 12 months, All time, or Custom for a quarter or financial year.",
      "Under Export this range, tap Orders CSV for one row per order: payment method and provider, subtotal, discount, total, tax, Vendl fee, card processing fee, tax on that fee, and net to you.",
      "Tap Line items CSV for one row per product sold, with quantity, price, whether it was tax-free and its tax.",
      "Paid and confirmed orders are included by default. Tick Include unpaid, abandoned and refunded to see every order.",
      "Open the files in Excel, Numbers or Google Sheets.",
    ],
    tips: [
      "Exports cover the business you have selected, in its timezone.",
      "Tax columns are named for your region (GST, VAT or Sales tax).",
      "Card processing fees appear once Stripe, Square or PayPal reports them, usually within an hour of the sale.",
      "In Australia, GST on processor fee is the GST you paid on card fees, for your BAS.",
    ],
  },
];
