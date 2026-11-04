/** Copy for the marketing home page. Plan facts must match why-pro/pro-benefits.ts. */

export const HOME_SKOOL_URL = "https://www.skool.com/vendl-9093/about";

export const HOME_AUDIENCE = [
  "Bakers & food producers",
  "Soap & candle makers",
  "Growers & farm shops",
  "Woodworkers & 3D makers",
  "Anyone who makes stuff and sells it",
] as const;

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
    caption: "Inside Vendl · website editor, with the Fletcherbrook Small Farm site",
  },
  {
    id: "orders",
    label: "Orders & stock",
    plan: "FREE & PRO",
    title: "A clear view of your business.",
    copy: "Keep products, stock and orders together. See sales across your selling channels and stay on top of low stock.",
    caption: "Inside Vendl · business dashboard with sales, orders and low stock",
  },
  {
    id: "calendar",
    label: "Your calendar",
    plan: "PRO",
    title: "See what’s coming up.",
    copy: "Bring pick-ups, pre-orders and production into one calendar, with two-way Google Calendar sync.",
    caption: "Inside Vendl · calendar with pick-ups and production days",
  },
];

export type MakersLpSellingItem = { title: string; body: string };

export function homeSellingItems(showSocial: boolean): MakersLpSellingItem[] {
  return [
    { title: "Sell ahead", body: "Pre-orders with order windows and collection days." },
    { title: "Make it a regular thing", body: "Subscriptions and memberships for repeat customers." },
    {
      title: "Keep showing up",
      body: showSocial
        ? "Email, social posts and video clips for your next release."
        : "Email campaigns and restock alerts for your next release.",
    },
    { title: "Take the shop with you", body: "QR checkout for your stall or in-person selling." },
  ];
}

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
] as const;

export const HOME_FREE_PERKS = [
  "Products, stock and orders",
  "Pre-orders, subscriptions & memberships",
  "QR checkout for stands & markets",
  "Customer lists, email campaigns & restock alerts",
  "Maker community access",
] as const;

export function homeProPerks(showSocial: boolean): string[] {
  const social = showSocial
    ? ["Social posts, scheduling & publishing", "Video clips with captions", "5 design + 5 video credits every month"]
    : ["Discount codes, upsell rules & shipping rates"];
  return [
    "Your website & custom domain connection",
    "Production, costing & pricing tools",
    ...social,
    "Product imports & the Vendl mobile app",
  ];
}
