import { readFileSync } from "node:fs";
import { join } from "node:path";
import NewsMarkdown from "@/components/NewsMarkdown";
import { SITE_URL } from "@/lib/legal";
import type { NewsArticle } from "../types";
import { stallsideVsBakesyFaqs } from "./stallside-vs-bakesy-faqs";
import { stallsideVsBakesySoftware } from "./stallside-vs-bakesy-software";

function Content() {
  const source = readFileSync(
    join(process.cwd(), "content/news/stallside-vs-bakesy.md"),
    "utf8",
  );
  return <NewsMarkdown source={source} />;
}

export const stallsideVsBakesyArticle: NewsArticle = {
  slug: "stallside-vs-bakesy",
  title:
    "Stallside vs Bakesy: Which Is Better for Unattended Payments, Pre-Orders and Inventory?",
  seoTitle:
    "Stallside vs Bakesy: Unattended Payments, Pre-Orders & Inventory",
  seoDescription:
    "Stallside vs Bakesy compared on unattended QR checkout, inventory, paid pre-orders, collection management, payment methods and pricing. Stallside suits unattended stands; Bakesy suits custom bakery order management.",
  excerpt:
    "A workflow-based comparison for stand holders, roadside sellers and home bakers choosing between unattended QR checkout and bakery order software.",
  publishedAt: "2026-08-06T09:00:00+10:00",
  updatedAt: "2026-08-06T09:00:00+10:00",
  author: {
    slug: "stallside",
    name: "Stallside",
    bio: "Comparisons and guides for farm stand, roadside stall and unattended retail sellers.",
    jobTitle: "Editorial",
    url: `${SITE_URL}/about`,
    sameAs: [
      "https://www.facebook.com/Stallsideapp",
      "https://www.instagram.com/stallsideapp/",
    ],
  },
  image: {
    src: "/news/stallside-vs-bakesy/stallside.png",
    alt: "Stallside scan-pay-sold workflow with customer checkout and owner sale alerts",
    width: 1024,
    height: 341,
    caption:
      "Comparing Stallside and Bakesy for unattended stand checkout, pre-orders and inventory",
  },
  featuredImagePlacement: "body-only",
  alternativeHeadline:
    "A workflow-based comparison for stand holders, roadside sellers and home bakers",
  articleSection: [
    "Software Comparisons",
    "Unattended Retail",
    "Farm Stands",
    "Home Bakery",
  ],
  keywords:
    "Stallside vs Bakesy, unattended QR checkout, farm stand payment app, honesty box payments, home bakery software, paid pre-orders, stall inventory management",
  wordCount: 4936,
  speakableSelectors: [".post-title", ".post-verdict"],
  mentions: [
    { name: "QR code self-checkout" },
    { name: "Inventory management" },
    { name: "Pre-orders and collection" },
    { name: "PayID", sameAs: "https://payid.com.au/" },
    {
      name: "Stripe",
      type: "Organization",
      sameAs: "https://stripe.com",
    },
  ],
  citations: [
    {
      name: "Stallside pricing",
      url: "https://stallside.app/#pricing",
    },
    {
      name: "Bakesy pricing and plans",
      url: "https://www.bakesy.app/pricing",
    },
    {
      name: "Bakesy FAQs",
      url: "https://www.bakesy.app/faqs",
    },
  ],
  audienceType:
    "Farm stand owners, roadside stall operators, honesty-box sellers, home bakers and collection preorder businesses",
  hasPart: [
    {
      name: "Direct pricing comparison",
      cssSelector: ".pricing-comparison",
    },
    {
      name: "Head-to-head feature matrix",
      cssSelector: ".feature-matrix",
    },
  ],
  comparedSoftware: stallsideVsBakesySoftware,
  faqs: stallsideVsBakesyFaqs,
  Content,
};
