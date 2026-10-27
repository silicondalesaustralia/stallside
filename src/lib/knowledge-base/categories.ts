import type { KnowledgeCategory } from "./types";
import { accountArticles } from "./account";
import { alertArticles } from "./alerts";
import { billingArticles } from "./billing";
import { businessSetupArticles } from "./business-setup";
import { communicationArticles } from "./communication";
import { customerArticles } from "./customers";
import { gettingStartedArticles } from "./getting-started";
import { gstArticles } from "./gst";
import { orderArticles } from "./orders";
import { paymentArticles } from "./payments";
import { preOrderArticles } from "./preorders";
import { productionArticles } from "./production";
import { productionBatchArticles } from "./production-batches";
import { productArticles } from "./products";
import { inventoryArticles } from "./products-inventory";
import { shopLayoutArticles } from "./shop-layout";
import { socialArticles } from "./social";
import { socialPublishingArticles } from "./social-publishing";
import { squareArticles } from "./square";
import { stripeArticles } from "./stripe";
import { subscriptionArticles } from "./subscriptions";
import { supplierArticles } from "./suppliers";
import { upsellArticles } from "./upsells";

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Set up your business, QR sign and first sale.",
    icon: "start",
    articles: [...gettingStartedArticles, ...businessSetupArticles],
  },
  {
    id: "products",
    title: "Products & stock",
    description: "Add products, organise your shop and keep stock right.",
    icon: "products",
    articles: [...productArticles, ...shopLayoutArticles, ...inventoryArticles],
  },
  {
    id: "orders",
    title: "Orders & customers",
    description: "Track sales, see who buys, and contact buyers.",
    icon: "orders",
    articles: [...orderArticles, ...customerArticles],
  },
  {
    id: "pre-orders",
    title: "Pre-orders & pick ups",
    description: "Take orders ahead of a bake or market day.",
    icon: "preorders",
    articles: preOrderArticles,
  },
  {
    id: "subscriptions",
    title: "Subscriptions & memberships",
    description: "Recurring boxes and fixed-term memberships.",
    icon: "subscriptions",
    articles: subscriptionArticles,
  },
  {
    id: "marketing",
    title: "Marketing & email",
    description: "Email customers and nudge bigger orders.",
    icon: "marketing",
    articles: [...communicationArticles, ...upsellArticles],
  },
  {
    id: "social",
    title: "Social media",
    description: "Coming soon: create, schedule and post content about your products.",
    icon: "social",
    articles: [...socialArticles, ...socialPublishingArticles],
  },
  {
    id: "production",
    title: "Production & costing",
    description: "Cost recipes, record batches and see real profit.",
    icon: "production",
    articles: [...productionArticles, ...productionBatchArticles],
  },
  {
    id: "suppliers",
    title: "Suppliers",
    description: "Sell a neighbour's produce and track what you owe.",
    icon: "suppliers",
    articles: supplierArticles,
  },
  {
    id: "payments",
    title: "Payments",
    description: "Cash, PayID, Stripe and Square.",
    icon: "payments",
    articles: [...paymentArticles, ...stripeArticles, ...squareArticles],
  },
  {
    id: "alerts",
    title: "Alerts & notifications",
    description: "Know the moment you make a sale or run low.",
    icon: "alerts",
    articles: alertArticles,
  },
  {
    id: "tax",
    title: "GST & exports",
    description: "GST for Australian sellers and spreadsheets for your accountant.",
    icon: "tax",
    articles: gstArticles,
  },
  {
    id: "account",
    title: "Plan & account",
    description: "Free and Pro, billing region, referrals and your account.",
    icon: "account",
    articles: [...billingArticles, ...accountArticles],
  },
];

export const START_HERE_SLUGS = [
  "first-stand",
  "sign-in-phone",
  "payments-overview",
  "pre-order-pages",
] as const;
