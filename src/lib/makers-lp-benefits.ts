import type { LucideIcon } from "lucide-react";
import {
  Boxes, Calculator, ClipboardList, Coins, Globe, LayoutGrid, Mail, Megaphone, PiggyBank, Store, Tags, Wallet,
} from "lucide-react";

/** Approved landing-page copy (VENDL_LANDING_PAGE_BUILD.md). Plan facts must match why-pro/pro-benefits.ts. */

export type MakersLpPlanTag = "FREE & PRO" | "PRO";

export type MakersLpHeroBullet = { lead: string; rest: string; sep?: string };

/** Bullets 1-4; bullet 5 carries the localized price and is rendered by the hero. */
export const MAKERS_LP_HERO_BULLETS: MakersLpHeroBullet[] = [
  {
    lead: "Run your making business in one place",
    rest: "with products, stock, orders and selling tools working together.",
    sep: ", ",
  },
  {
    lead: "You don't need a full website to start selling",
    rest: "Vendl Free gives you a shop link you can share.",
    sep: ". ",
  },
  {
    lead: "Know what each product really costs",
    rest: "(including materials, packaging, labour and overheads) with Pro's production tools.",
  },
  {
    lead: "Keep customers connected",
    rest: "with email marketing and newsletters on Free, with additional promotional tools on Pro.",
  },
];

export type MakersLpBenefit = { title: string; body: string; icon: LucideIcon; tag: MakersLpPlanTag };

export const MAKERS_LP_CORE_BENEFITS: MakersLpBenefit[] = [
  { title: "Run everything in one place", body: "Less switching between disconnected tools.", icon: LayoutGrid, tag: "FREE & PRO" },
  { title: "Know your product costs", body: "Understand materials, labour, and overheads.", icon: Calculator, tag: "PRO" },
  { title: "Price with confidence", body: "Set prices using target margins.", icon: Coins, tag: "PRO" },
  { title: "Keep stock and orders organised", body: "Manage the selling side of your business.", icon: Boxes, tag: "FREE & PRO" },
  { title: "Sell online with ease", body: "Start with a shareable shop.", icon: Store, tag: "FREE & PRO" },
  { title: "Market your products", body: "Access email, promotions, and social marketing tools.", icon: Megaphone, tag: "FREE & PRO" },
  { title: "Keep more of what you earn", body: "Start Free; Pro has no Vendl transaction fee.", icon: PiggyBank, tag: "FREE & PRO" },
];

export type MakersLpFeatureGroupId = "selling" | "tools" | "growth";

export const MAKERS_LP_FEATURE_GROUPS: { id: MakersLpFeatureGroupId; label: string }[] = [
  { id: "selling", label: "Everyday selling" },
  { id: "tools", label: "Maker business tools" },
  { id: "growth", label: "Growth & plans" },
];

export type MakersLpFeature = {
  title: string;
  body: string;
  icon: LucideIcon;
  tag: MakersLpPlanTag;
  group: MakersLpFeatureGroupId;
};

/** Blocks 1-8; block 9 (plans and prices) is localized and rendered by the features section. */
export const MAKERS_LP_FEATURES: MakersLpFeature[] = [
  {
    title: "Products, stock and orders in one place",
    body: "Manage your product listings, inventory and customer orders from one system, so you spend less time switching between tools and more time making and selling.",
    icon: LayoutGrid,
    tag: "FREE & PRO",
    group: "selling",
  },
  {
    title: "Shareable online shop",
    body: "Start selling with a shop link you can send to customers. You don't need to build a complete website before you can take orders.",
    icon: Store,
    tag: "FREE & PRO",
    group: "selling",
  },
  {
    title: "Stock management",
    body: "Keep track of the products you have available, helping you stay organised as orders come in.",
    icon: Boxes,
    tag: "FREE & PRO",
    group: "selling",
  },
  {
    title: "Order management",
    body: "See and manage customer purchases alongside your products and stock, making the selling side of your business easier to handle.",
    icon: ClipboardList,
    tag: "FREE & PRO",
    group: "selling",
  },
  {
    title: "Production costing",
    body: "Account for materials, ingredients, packaging, labour and overheads to understand what your products cost to make before you set your selling prices.",
    icon: Calculator,
    tag: "PRO",
    group: "tools",
  },
  {
    title: "Pricing tools",
    body: "Use your production costs and target margins to make more informed pricing decisions instead of relying on guesswork.",
    icon: Tags,
    tag: "PRO",
    group: "tools",
  },
  {
    title: "Email marketing and newsletters",
    body: "Stay connected with customers using email tools available on Free. Pro adds discounts, promotions, retention tools and social marketing features.",
    icon: Mail,
    tag: "FREE & PRO",
    group: "growth",
  },
  {
    title: "Website builder and custom domain",
    body: "Move beyond a shareable shop link with a more complete branded online presence as your business grows.",
    icon: Globe,
    tag: "PRO",
    group: "growth",
  },
];

export const MAKERS_LP_PLANS_FEATURE = { title: "Free and Pro selling plans", icon: Wallet } as const;
