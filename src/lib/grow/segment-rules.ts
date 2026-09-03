export type SegmentRules = {
  minOrders?: number;
  maxOrders?: number;
  minSpendCents?: number;
  maxSpendCents?: number;
  daysSinceLastOrderMin?: number;
  daysSinceLastOrderMax?: number;
  firstOrderWithinDays?: number;
  productIds?: string[];
  categoryIds?: string[];
  menuIds?: string[];
  tagIds?: string[];
  marketingConsent?: boolean;
  subscriptionActive?: boolean;
  hasRestockInterest?: boolean;
};

export function parseSegmentRules(raw: unknown): SegmentRules {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as SegmentRules;
}

export const SEGMENT_PRESETS: Record<
  string,
  { name: string; description: string; rules: SegmentRules }
> = {
  best_customers: {
    name: "Best customers",
    description: "3+ orders and at least $150 spent",
    rules: { minOrders: 3, minSpendCents: 15000, marketingConsent: true },
  },
  new_customers: {
    name: "New customers",
    description: "First purchase in the last 30 days",
    rules: { maxOrders: 1, firstOrderWithinDays: 30, marketingConsent: true },
  },
  repeat_customers: {
    name: "Repeat customers",
    description: "2 or more qualifying orders",
    rules: { minOrders: 2, marketingConsent: true },
  },
  lapsed: {
    name: "Haven't ordered recently",
    description: "Previously purchased, no order in 60+ days",
    rules: { minOrders: 1, daysSinceLastOrderMin: 60, marketingConsent: true },
  },
  subscribers: {
    name: "Active subscribers",
    description: "Customers with an active subscription",
    rules: { subscriptionActive: true, marketingConsent: true },
  },
  restock: {
    name: "Restock interest",
    description: "Waiting on a restock alert",
    rules: { hasRestockInterest: true },
  },
};
