/** Upgrade-card copy for each Pro-only area; the Why Pro page lists the same features. */
export const PRO_GATES = {
  website: {
    title: "Your website",
    eyebrow: "Website builder",
    body: "Build your own website with Web Studio, add pages and a blog, claim your vendl.app subdomain or connect your own domain, set up redirects, and add Google, Meta and TikTok tags.",
  },
  discounts: {
    title: "Discounts",
    eyebrow: "Discount codes",
    body: "Create discount codes for your online store and stall checkout: percentage or amount off, free shipping, minimum spend, start and end dates, usage limits and first-order codes.",
  },
  reviews: {
    title: "Reviews",
    eyebrow: "Customer reviews",
    body: "Collect product reviews on your website, approve them before they go live, reply publicly and email reviewers.",
  },
  communication: {
    title: "Communications",
    eyebrow: "Email marketing",
    body: "Send branded email campaigns and newsletters to saved lists, past buyers or one customer, see sent and click counts, and email your restock list when you're back in stock. Restock sign-ups keep collecting on Free.",
  },
  production: {
    title: "Production",
    eyebrow: "Production & costing",
    body: "Track batches and materials, cost every recipe including packaging, scan supplier invoices with AI, set prices from your margins and see profit & loss per product.",
  },
  calendar: {
    title: "Calendar",
    eyebrow: "Calendar",
    body: "See pick-ups, pre-orders and posts in one calendar, drag to reschedule, and sync both ways with Google Calendar.",
  },
  qrCodes: {
    title: "QR codes",
    eyebrow: "More QR codes",
    body: "Make extra QR codes that open any page of your store, such as a category, product or menu, each with its own designed poster. Your main business QR code stays free.",
  },
  upsells: {
    title: "Upsells & offers",
    eyebrow: "Cart upsell rules",
    body: "Create reusable cart upsells for everything, chosen categories or chosen products, separately for your website and your stall. Your business default upsell and product upsells stay free.",
  },
  shipping: {
    title: "Shipping",
    eyebrow: "Shipping rates",
    body: "Charge shipping with a flat rate or a per-product rate, with free shipping over an amount you choose. On Free, orders that ship have no shipping charge.",
  },
  dataImport: {
    title: "Data import",
    eyebrow: "Import data",
    body: "Import products, customers, pages and subscriptions from Shopify, WooCommerce, Squarespace, Wix, Square or another Vendl business. Exporting your data stays free.",
  },
} as const;

export type ProGateKey = keyof typeof PRO_GATES;
