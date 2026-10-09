import type { BusinessMode } from "@/lib/business-mode";
import type { TemplatePackage } from "./package-schema";

export type CustomerGoal = "shop" | "release" | "subscribe" | "enquire";

export type CustomerGoalOption = {
  id: CustomerGoal;
  label: string;
  hint?: string;
  modes?: BusinessMode[];
};

export const CUSTOMER_GOALS: CustomerGoalOption[] = [
  { id: "shop", label: "Buy from my range" },
  {
    id: "release",
    label: "Order this week's menu or drop",
    modes: ["FOOD_BUSINESS", "BOTH"],
  },
  {
    id: "subscribe",
    label: "Subscribe to a regular box",
    hint: "Set up a subscription offer under Subscriptions to take sign-ups.",
  },
  {
    id: "enquire",
    label: "Find out about us and get in touch",
    hint: "No online ordering needed.",
  },
];

const PREFERENCE: Record<CustomerGoal, string[]> = {
  shop: ["product-first", "story-first", "weekly-release"],
  release: ["weekly-release", "product-first", "story-first"],
  subscribe: ["weekly-release", "product-first", "story-first"],
  enquire: ["story-first", "product-first", "weekly-release"],
};

export function goalsFor(mode: BusinessMode): CustomerGoalOption[] {
  return CUSTOMER_GOALS.filter((g) => !g.modes || g.modes.includes(mode));
}

export function parseCustomerGoal(raw: string | undefined, mode: BusinessMode): CustomerGoal | null {
  return goalsFor(mode).find((g) => g.id === raw)?.id ?? null;
}

/** Best match first; without a goal the packages keep their default order. */
export function rankTemplatePackages(packages: TemplatePackage[], goal: CustomerGoal | null): TemplatePackage[] {
  if (!goal) return packages;
  const order = PREFERENCE[goal];
  const rank = (p: TemplatePackage) => {
    const i = order.indexOf(p.id);
    return i === -1 ? order.length : i;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
}
