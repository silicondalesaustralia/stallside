import type { FeatureVisual } from "@/lib/features/types";

/** Hero visual per feature slug. */
export const FEATURE_VISUALS: Record<string, FeatureVisual> = {
  "online-shop": "shop",
  "pre-orders": "preorders",
  subscriptions: "subscriptions",
  "stall-checkout": "stall",
  bundles: "bundles",
  payments: "payments",
  inventory: "inventory",
  orders: "orders",
  suppliers: "suppliers",
  calendar: "calendar",
  customers: "customers",
  "email-marketing": "email",
  social: "social",
  "restock-alerts": "restock",
  costing: "costing",
  website: "website",
};

export type FeatureLogoStrip = "payments" | "platforms" | null;

export function featureLogoStrip(slug: string): FeatureLogoStrip {
  if (slug === "payments" || slug === "stall-checkout") return "payments";
  if (slug === "website" || slug === "online-shop") return "platforms";
  return null;
}

export function resolveFeatureVisual(
  slug: string,
  fallback: FeatureVisual = "dashboard",
): FeatureVisual {
  return FEATURE_VISUALS[slug] ?? fallback;
}
