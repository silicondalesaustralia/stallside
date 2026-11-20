import type { FeaturePage } from "@/lib/features/types";

export const MAKE_SITE_FEATURES: FeaturePage[] = [
  {
    slug: "costing",
    title: "Recipes & costing",
    menuBlurb: "Materials, labour, overheads and margin.",
    eyebrow: "WHAT DOES IT COST TO MAKE?",
    plan: "PRO",
    metaTitle: "Recipes & costing · Vendl",
    metaDescription:
      "Bring materials, packaging, labour and overheads into one calculation. Cost batches and set a price with your margin in mind.",
    headline: "What does it really cost to make?",
    support:
      "Ingredients or parts, packaging, labour and overheads in one place. Cost your batches and set a price with margin — the same maths as the home-page calculator.",
    visual: "costing",
    bullets: [
      "Batches and materials with pack prices",
      "Recipes, waste, labour and overheads",
      "Price from margin or margin from price",
      "AI invoice scanning to speed up material entry",
      "Profit and loss for the wider picture",
    ],
    steps: [
      { title: "Add materials", body: "Record pack prices and how much each batch uses." },
      { title: "Cost the batch", body: "Include waste, labour minutes and overhead." },
      { title: "Set the price", body: "Type a margin to get a price, or a price to see margin." },
    ],
    freeVsPro: {
      free: ["Try the public costing demo on the home page"],
      pro: ["Batches & materials", "Recipes, costing & pricing", "AI invoice scanning", "Profit & loss"],
    },
    faqs: [
      {
        q: "Is costing on Free?",
        a: "Full recipes, batches and P&L are Pro. Anyone can try the costing calculator on the marketing home page.",
      },
    ],
    relatedSlugs: ["inventory", "website", "orders"],
  },
  {
    slug: "website",
    title: "Web Studio",
    menuBlurb: "Pages, blog and your own domain.",
    eyebrow: "YOUR OWN WEBSITE",
    plan: "PRO",
    metaTitle: "Web Studio · Vendl",
    metaDescription:
      "Build your website with Web Studio — pages, blog, custom domain, reviews, tags and pixels on Pro.",
    headline: "A proper home for what you make.",
    support:
      "Build pages and a blog, connect your own domain, and let customers shop products, pre-orders and memberships on a site that looks like you.",
    visual: "website",
    bullets: [
      "Web Studio for pages and blog",
      "Your own web address",
      "Tags and pixels for ads and analytics",
      "Reviews on your site",
      "URL redirects when you move pages",
    ],
    steps: [
      { title: "Start from a layout", body: "Pick a look and edit headings, colours and sections." },
      { title: "Connect a domain", body: "Use a Vendl subdomain first, then point your own address." },
      { title: "Publish", body: "Shop, pre-orders and memberships sit on the same site." },
    ],
    freeVsPro: {
      free: ["Shop link with logo and colours"],
      pro: ["Web Studio", "Custom domain", "Blog, reviews, tags and pixels"],
    },
    faqs: [
      {
        q: "Can I keep my current website?",
        a: "Yes. Share Vendl shop or selling links from your existing site, or move to Web Studio when you are ready.",
      },
    ],
    relatedSlugs: ["online-shop", "pre-orders", "payments"],
  },
];
