import { PRO_MONTHLY_ALLOWANCE } from "@/lib/socialCredits/packs";

/** Free vs Pro differences that are enforced in code; keep in sync with the Pro checks and PRO_GATES. */
export type ProBenefit = { title: string; body: string; free: string; pro: string; social?: boolean };
export type ProBenefitGroupId = "business" | "marketing" | "community" | "soon";
export type ProBenefitGroup = { id: ProBenefitGroupId; heading: string; items: ProBenefit[] };

const NOT_INCLUDED = "Not included";
const included = (title: string, body: string): ProBenefit => ({ title, body, free: NOT_INCLUDED, pro: "Included" });
const { design, clip } = PRO_MONTHLY_ALLOWANCE;

const BUSINESS: ProBenefit[] = [
  included("Batches & materials", "Record each batch you make, track ingredients and packaging, and keep stock up to date automatically."),
  included("Recipes, costing & pricing", "Cost every recipe including packaging, then set prices from the margin you want."),
  included("AI invoice scanning", "Photograph a supplier invoice and Vendl adds the materials and prices for you."),
  included("Profit & loss", "See what each product really earns after ingredients, packaging and fees."),
  {
    title: "The Vendl app",
    body: "Run your business from your phone with the Vendl app for iPhone and Android, with instant order alerts.",
    free: "Browser dashboard",
    pro: "iPhone & Android app",
  },
  {
    title: "Calendar",
    body: "See pick-ups, pre-orders and posts in one place, drag to reschedule, and sync both ways with Google Calendar.",
    free: NOT_INCLUDED,
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
];

const MARKETING: ProBenefit[] = [
  {
    title: "No Vendl fee on card sales",
    body: "Keep the 2.5% Vendl fee on every card, Tap & Go, Apple Pay, Google Pay and pay-later sale through Stripe and Square. Processing fees from Stripe or Square still apply.",
    free: "2.5% Vendl fee",
    pro: "0% Vendl fee",
  },
  included("PayPal checkout", "Let customers pay with PayPal alongside cards, cash and bank payments."),
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
  {
    title: "Email marketing",
    body: "Send branded email campaigns and newsletters to saved lists, past buyers or one customer, with sent and click counts, and email your restock list when you're back in stock.",
    free: "Restock sign-ups only",
    pro: "Campaigns & newsletters",
  },
  included("Reviews", "Collect product reviews on your website, approve them before they show, and reply publicly."),
  included("URL redirects", "Rename a product or page without breaking old links, so customers and Google never hit a dead end."),
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
  {
    title: "Social credits every month",
    body: `${design} design credits and ${clip} video clip credits each month for social posts, used before any packs you buy.`,
    free: "Buy packs as needed",
    pro: `${design} designs + ${clip} clips monthly`,
    social: true,
  },
  {
    title: "AI video clips",
    body: "Upload a tour, bake day or product explainer up to 30 minutes long and Vendl finds the best moments, cutting them into short captioned clips for Reels, TikTok and Shorts.",
    free: "With credit packs",
    pro: "Included",
    social: true,
  },
  {
    title: "Video editor",
    body: "Trim and cut, mute sections, change the speed, add auto captions and text, blur faces or number plates, and add your logo and a headline, then download the finished video.",
    free: "With credit packs",
    pro: "Included",
    social: true,
  },
];

const COMMUNITY: ProBenefit[] = [
  {
    title: "Skool Pro sections",
    body: "Advanced tutorials, templates and guides, private discussions, and live workshops, coaching and Q&A where available.",
    free: "Community access",
    pro: "Plus Pro sections",
  },
  {
    title: "Earn from referrals",
    body: "Earn 50% of every Pro payment from businesses you refer, for as long as they stay on Pro.",
    free: NOT_INCLUDED,
    pro: "50% lifetime commission",
  },
];

/** Groups for the accordions and comparison; social tools move to "Coming soon" until Social is live for the owner. */
export function proBenefitGroups(socialReady: boolean): ProBenefitGroup[] {
  const marketing = socialReady ? MARKETING : MARKETING.filter((b) => !b.social);
  const groups: ProBenefitGroup[] = [
    { id: "business", heading: "Production & business tools", items: BUSINESS },
    { id: "marketing", heading: "Marketing & selling tools", items: marketing },
    { id: "community", heading: "Community & learning", items: COMMUNITY },
  ];
  if (!socialReady) {
    groups.push({ id: "soon", heading: "Coming soon", items: MARKETING.filter((b) => b.social) });
  }
  return groups;
}
