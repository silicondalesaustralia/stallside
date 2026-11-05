/** Copy for the marketing home page. Plan facts must match why-pro/pro-benefits.ts. */

export const HOME_SKOOL_URL = "https://www.skool.com/vendl-9093/about";

export type MakersLpTab = {
  id: string;
  label: string;
  plan: string;
  title: string;
  copy: string;
  caption: string;
};

export const HOME_TABS: MakersLpTab[] = [
  {
    id: "website",
    label: "Your website",
    plan: "PRO",
    title: "A proper home for what you make.",
    copy: "Build your website, use your own domain and let customers shop your products, pre-orders and memberships.",
    caption: "Illustrative preview · the website editor, styled on the Fletcherbrook Small Farm site",
  },
  {
    id: "orders",
    label: "Orders & stock",
    plan: "FREE & PRO",
    title: "A clear view of your business.",
    copy: "Keep products, stock and orders together. See sales across your selling channels and stay on top of low stock.",
    caption: "Illustrative preview · business dashboard with sales, orders and low stock (sample data)",
  },
  {
    id: "calendar",
    label: "Your calendar",
    plan: "PRO",
    title: "See what’s coming up.",
    copy: "Bring pick-ups, pre-orders and production into one calendar, with two-way Google Calendar sync.",
    caption: "Illustrative preview · calendar with pick-ups and production days (sample data)",
  },
];

export const HOME_IMPORT_SOURCES = [
  { name: "Shopify", icon: "/brand/platforms/shopify.svg" },
  { name: "Wix", icon: "/brand/platforms/wix.svg" },
  { name: "WooCommerce", icon: "/brand/platforms/woocommerce.svg" },
  { name: "Squarespace", icon: "/brand/platforms/squarespace.svg" },
  { name: "Square", icon: "/brand/platforms/square.svg" },
] as const;

export const HOME_COMMUNITY_POINTS = [
  {
    label: "01 / LEARN",
    title: "Practical business lessons.",
    body: "Store setup, social media, email, SEO, paid ads, pricing and everyday operations.",
  },
  {
    label: "02 / SHARE",
    title: "A place to ask and contribute.",
    body: "Bring your questions, share what’s working and meet other producers.",
  },
  {
    label: "03 / PRO ONLY",
    title: "Extra resources on Pro.",
    body: "Pro unlocks gated sections with advanced tutorials, templates and guides, private discussions, and live workshops, coaching and Q&A where available.",
  },
] as const;

export const MAKERS_LP_FREE_PERKS = [
  "Shareable shop link",
  "Product listings",
  "Stock management",
  "Order management",
  "Email marketing and newsletters",
  "Skool community access",
] as const;

export const MAKERS_LP_PRO_PERKS = [
  "Everything in Free",
  "Production costing and pricing",
  "Recipes, materials, and batches",
  "Web Studio and custom domain",
  "Advanced marketing and social tools",
  "Additional selling and business-management features",
  "Exclusive Skool community resources",
  "No Vendl transaction fee",
] as const;

export const MAKERS_LP_FREE_FEE =
  "2.5% Vendl fee on eligible card, tap, and pay-later transactions. Some other payment methods have no Vendl fee. Payment-provider fees may still apply.";

export const MAKERS_LP_PRO_FEE = "No Vendl transaction fee. Payment-provider fees still apply. Domain purchases cost extra.";
