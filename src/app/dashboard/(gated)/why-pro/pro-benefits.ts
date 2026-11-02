/** Free vs Pro differences that are enforced in code; keep in sync with the Pro checks. */
export type ProBenefit = { title: string; body: string; free: string; pro: string };

export const PRO_BENEFITS: ProBenefit[] = [
  {
    title: "No Vendl fee on card sales",
    body: "Keep the 2.5% Vendl fee on every card, Tap & Go, Apple Pay, Google Pay and pay-later sale through Stripe and Square. Processing fees from Stripe or Square still apply.",
    free: "2.5% Vendl fee",
    pro: "0% Vendl fee",
  },
  {
    title: "Your own website",
    body: "Build a full website in Web Studio with your own pages, blog and branding, and publish it whenever you're ready.",
    free: "Store link only",
    pro: "Web Studio, pages & blog",
  },
  {
    title: "Your own web address",
    body: "Claim your free yourname.vendl.app address or connect a domain you own, with security certificates handled for you.",
    free: "vendl.app/s/… link",
    pro: "Subdomain or custom domain",
  },
  {
    title: "Tags & Pixels",
    body: "Connect Google Analytics, Search Console, Google Ads, Meta, TikTok, Pinterest and more. Server-side purchase tracking, a cookie banner and an automatic privacy notice are included.",
    free: "—",
    pro: "Included",
  },
  {
    title: "URL redirects",
    body: "Rename a product or page without breaking old links, so customers and Google never hit a dead end.",
    free: "—",
    pro: "Included",
  },
  {
    title: "PayPal checkout",
    body: "Let customers pay with PayPal alongside cards, cash and bank payments.",
    free: "—",
    pro: "Included",
  },
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
];

export const FREE_INCLUDES = [
  "Products, categories, pre-orders and subscriptions",
  "Orders, customers, inventory and pick-ups",
  "Cash, PayID and local bank payments with no Vendl fee",
  "Card payments through Stripe and Square (2.5% Vendl fee)",
  "QR codes, discounts, upsells, reviews and email campaigns",
  "Production batches, recipes and profit & loss",
];
