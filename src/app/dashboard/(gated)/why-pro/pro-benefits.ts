/** Free vs Pro differences that are enforced in code; keep in sync with the Pro checks and PRO_GATES. */
export type ProBenefit = { title: string; body: string; free: string; pro: string };
export type ProBenefitGroup = { heading: string; items: ProBenefit[] };

const included = (title: string, body: string): ProBenefit => ({ title, body, free: "—", pro: "Included" });

export const PRO_BENEFIT_GROUPS: ProBenefitGroup[] = [
  {
    heading: "Keep more of every sale",
    items: [
      {
        title: "No Vendl fee on card sales",
        body: "Keep the 2.5% Vendl fee on every card, Tap & Go, Apple Pay, Google Pay and pay-later sale through Stripe and Square. Processing fees from Stripe or Square still apply.",
        free: "2.5% Vendl fee",
        pro: "0% Vendl fee",
      },
      included("PayPal checkout", "Let customers pay with PayPal alongside cards, cash and bank payments."),
    ],
  },
  {
    heading: "Your own website",
    items: [
      {
        title: "Web Studio, pages & blog",
        body: "Build a full website with your own pages, blog and branding, with AI to help you write it, and publish whenever you're ready.",
        free: "Store link only",
        pro: "Full website",
      },
      {
        title: "Your own web address",
        body: "Claim your yourname.vendl.app address or connect a domain you own, with security certificates handled for you.",
        free: "vendl.app/s/… link",
        pro: "Subdomain or custom domain",
      },
      included("Tags & Pixels", "Connect Google Analytics, Search Console, Google Ads, Meta, TikTok, Pinterest and more, with server-side purchase tracking, a cookie banner and an automatic privacy notice."),
      included("Reviews", "Collect product reviews on your website, approve them before they show, and reply publicly."),
      included("URL redirects", "Rename a product or page without breaking old links, so customers and Google never hit a dead end."),
    ],
  },
  {
    heading: "Sell more",
    items: [
      {
        title: "Discount codes",
        body: "Codes for your website and stall checkout: percentage or amount off, free shipping, minimum spend, start and end dates, usage limits and first-order codes.",
        free: "First-order discount",
        pro: "Unlimited discount codes",
      },
      {
        title: "Cart upsell rules",
        body: "Offer the right extra item for everything, chosen categories or chosen products, separately on your website and at your stall.",
        free: "Default and product upsells",
        pro: "Unlimited upsell rules",
      },
      {
        title: "Shipping rates",
        body: "Charge a flat rate or a per-product rate, with free shipping over an amount you choose.",
        free: "No shipping charge",
        pro: "Flat, per product, free over",
      },
    ],
  },
  {
    heading: "Run your kitchen",
    items: [
      included("Batches & materials", "Record each batch you make, track ingredients and packaging, and keep stock up to date automatically."),
      included("Recipes, costing & pricing", "Cost every recipe including packaging, then set prices from the margin you want."),
      included("AI invoice scanning", "Photograph a supplier invoice and Vendl adds the materials and prices for you."),
      included("Profit & loss", "See what each product really earns after ingredients, packaging and fees."),
    ],
  },
  {
    heading: "Stay organised",
    items: [
      {
        title: "The Vendl app",
        body: "Run your business from your phone with the Vendl app for iPhone and Android, with instant order alerts.",
        free: "Browser dashboard",
        pro: "iPhone & Android app",
      },
      {
        title: "Calendar",
        body: "See pick-ups, pre-orders and posts in one place, drag to reschedule, and sync both ways with Google Calendar.",
        free: "—",
        pro: "With Google Calendar sync",
      },
      {
        title: "More QR codes",
        body: "Make QR codes that open any page of your store, each with its own designed poster.",
        free: "Main business QR code",
        pro: "Unlimited QR codes",
      },
      {
        title: "Data import",
        body: "Bring products (with stock) and customers across from Shopify, WooCommerce, Squarespace, Wix, Square or any spreadsheet.",
        free: "Export only",
        pro: "Import and export",
      },
    ],
  },
  {
    heading: "Social & referrals",
    items: [
      {
        title: "Social credits every month",
        body: "5 design credits and 5 video clip credits each month for social posts, used before any packs you buy.",
        free: "Buy packs as needed",
        pro: "5 designs + 5 clips monthly",
      },
      {
        title: "Earn from referrals",
        body: "Earn 50% of every Pro payment from businesses you refer, for as long as they stay on Pro.",
        free: "—",
        pro: "50% lifetime commission",
      },
    ],
  },
];
