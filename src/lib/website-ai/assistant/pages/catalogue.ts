import type { AssistantContext } from "../context/types";
import type { BriefData, PolicyPageId } from "../brief/schema";

export const ASSISTANT_PAGE_IDS = ["HOME", "ABOUT", "CONTACT", "FAQ", "SHOP", "VISIT", "REVIEWS", "BLOG"] as const;
export type AssistantPageId = (typeof ASSISTANT_PAGE_IDS)[number];

export type PageOption = {
  id: AssistantPageId;
  label: string;
  description: string;
  recommended: boolean;
  available: boolean;
  /** Plain prerequisite shown when the page can't be built yet. */
  prerequisite?: string;
};

export const POLICY_LABELS: Record<PolicyPageId, string> = {
  PRIVACY: "Privacy policy",
  TERMS: "Terms of service",
  REFUNDS: "Returns & refunds",
  SHIPPING: "Shipping & pickup",
};

/** Max customer pages per build (Home included); policies are counted separately. */
export const MAX_SELECTED_PAGES = 8;

export function isAssistantPageId(value: string): value is AssistantPageId {
  return (ASSISTANT_PAGE_IDS as readonly string[]).includes(value);
}

/** Recommended customer pages from real capabilities and the brief. */
export function pageOptions(ctx: AssistantContext, brief: BriefData): PageOption[] {
  const goal = brief.business.primaryGoal;
  const hasProducts = ctx.catalogue.productCount > 0;
  const local = ctx.features.pickup || ctx.businessMode !== "FOOD_BUSINESS" || goal === "local_visits";
  return [
    { id: "HOME", label: "Home", description: "Always included.", recommended: true, available: true },
    { id: "ABOUT", label: "About", description: "Your story and what makes you different.", recommended: true, available: true },
    { id: "CONTACT", label: "Contact", description: "A contact form and how to reach you.", recommended: true, available: true },
    { id: "FAQ", label: "FAQ", description: "Answers about ordering, pickup and your products.", recommended: true, available: true },
    {
      id: "SHOP",
      label: "Shop",
      description: "Your live products, ready to buy.",
      recommended: hasProducts && goal !== "information",
      available: hasProducts,
      prerequisite: hasProducts ? undefined : "Add products in Vendl to include a shop.",
    },
    {
      id: "VISIT",
      label: "Visit us",
      description: "Where and when customers can find you or collect orders.",
      recommended: local,
      available: true,
    },
    {
      id: "REVIEWS",
      label: "Reviews",
      description: "Your approved customer reviews.",
      recommended: ctx.reviews.count >= 2,
      available: ctx.reviews.count > 0,
      prerequisite: ctx.reviews.count > 0 ? undefined : "Shows once you have approved customer reviews.",
    },
    {
      id: "BLOG",
      label: "Blog",
      description: "Your existing blog with a short intro. We never write fake posts.",
      recommended: false,
      available: true,
    },
  ];
}

/** Default selection for a fresh brief. */
export function defaultSelectedPages(ctx: AssistantContext, brief: BriefData): string[] {
  return pageOptions(ctx, brief)
    .filter((p) => p.available && p.recommended)
    .map((p) => p.id);
}

/** Notes about features the builder links to but can't create. */
export function featureNotes(ctx: AssistantContext): string[] {
  const notes: string[] = [];
  if (ctx.features.subscriptions.length === 0) {
    notes.push("Subscriptions can be featured once you have an active subscription offer.");
  }
  if (ctx.features.menus.length === 0 && ctx.features.preOrders.length === 0 && ctx.businessMode !== "FARM_STAND") {
    notes.push("Weekly menus and pre-orders appear once you set one up in Vendl.");
  }
  if (!ctx.features.cardPayments) {
    notes.push("Card payments aren't connected yet, so customers will pay when they collect.");
  }
  return notes;
}
