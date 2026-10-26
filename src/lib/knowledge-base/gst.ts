import type { KnowledgeArticle } from "./types";

export const gstArticles: KnowledgeArticle[] = [
  {
    slug: "enable-gst",
    title: "Set up GST, VAT or sales tax",
    summary:
      "Tell Vendl where you trade and whether you're registered. GST and VAT are worked out inside your prices; US and Canadian sales tax is added at checkout. Orders, receipts and exports then carry the right tax.",
    videoUrl: null,
    omitVideo: true,
    related: ["export-orders", "payments-overview"],
    ctas: [
      { label: "Tax settings", href: "/dashboard/settings/tax" },
      { label: "Products", href: "/dashboard/products" },
    ],
    steps: [
      "Open Settings, then Tax in the sidebar. Choose your country. Australia and New Zealand use GST; the UK, Ireland and EU countries use VAT; the US and Canada use sales tax.",
      "Only turn tax on if you're registered with your tax office (for example the ATO, IRD or HMRC, or your state for US sales tax). Enter your tax ID - ABN, GST number, VAT number or sales tax permit - and tick Registered.",
      "GST and VAT countries: your shelf prices already include tax, so they stay the same. Vendl works out the tax inside each price (for example 1/11 at 10% GST, 1/6 at 20% VAT), after any discount.",
      "US and Canada: enter your combined state and local (or provincial) rate, e.g. 8.25. Shoppers see the sales tax added to their cart total, and it's charged with card, Square, PayPal and cash orders.",
      "Mark tax-free or zero-rated products, like fresh fruit and veg, eggs and plain bread, on each product's page. The Tax page lists every product you've marked. Check with your accountant if you're unsure.",
      "Charge tax on delivery? Tick the delivery option on the Tax page. In GST and VAT countries the tax is counted inside your delivery fee; in the US and Canada it's added on top.",
      "Subscriptions and memberships renew at a fixed price, so in the US and Canada include sales tax in that price. In GST and VAT countries Vendl records the tax inside each renewal.",
      "Customer receipts show the tax on each order, with your tax ID.",
      "GST and VAT countries: to add tax to orders you took before turning it on, or after changing tax-free products, tap Sync on the Tax page. Untick Registered and Sync to set past orders back to zero.",
    ],
  },
  {
    slug: "export-orders",
    title: "Export orders for your accountant",
    summary:
      "Download your orders as a spreadsheet with totals, tax (GST, VAT or sales tax), Vendl fees, card processing fees and what you received.",
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
      "Tax columns are named for your region (GST, VAT or Sales tax) and show the tax collected on sales. In Australia, GST on processor fee is the GST you paid on Stripe or Square fees, for your BAS. Your accountant can take it from there.",
      "Files open in Excel, Numbers or Google Sheets.",
    ],
  },
];
