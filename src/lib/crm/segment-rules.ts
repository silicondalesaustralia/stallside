import { z } from "zod";

/** Rules for a saved customer list (CustomerSegment.rules). */
export const segmentRulesSchema = z
  .object({
    /** Customers who purchased any of these products. */
    productIds: z.array(z.string().min(1)).max(50).optional(),
    /** Limit purchases to last N days (with productIds). */
    purchasedWithinDays: z.number().int().positive().max(3650).optional(),
    /** Customers with at least one pre-order. */
    preOrderOnly: z.boolean().optional(),
    /** Active restock-alert opt-ins (grows as shoppers subscribe). */
    hasRestockInterest: z.boolean().optional(),
    /** Explicit members from CSV / manual pick. */
    staticCustomerIds: z.array(z.string().min(1)).max(5000).optional(),
    /** Require marketing consent when resolving. */
    marketingConsentOnly: z.boolean().optional(),
    /** Must have an email on file. */
    requireEmail: z.boolean().optional(),
  })
  .strict();

export type SegmentRules = z.infer<typeof segmentRulesSchema>;

export function parseSegmentRules(raw: unknown): SegmentRules {
  const parsed = segmentRulesSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : {};
}

export function describeSegmentRules(rules: SegmentRules): string {
  const parts: string[] = [];
  if (rules.staticCustomerIds?.length) {
    parts.push(`${rules.staticCustomerIds.length} saved contacts`);
  }
  if (rules.productIds?.length) {
    const window = rules.purchasedWithinDays
      ? ` in the last ${rules.purchasedWithinDays} days`
      : "";
    parts.push(`bought ${rules.productIds.length} selected product(s)${window}`);
  }
  if (rules.preOrderOnly) parts.push("pre-order customers");
  if (rules.hasRestockInterest) parts.push("restock alert opt-ins");
  if (rules.marketingConsentOnly) parts.push("marketing consent");
  if (rules.requireEmail) parts.push("has email");
  return parts.length ? parts.join(" · ") : "No filters yet";
}

/** System lists managed in Communication (hidden from Customers → Lists). */
export const STANDING_LIST_PRESET_KEYS = ["restock"] as const;
export type StandingListPresetKey = (typeof STANDING_LIST_PRESET_KEYS)[number];

export function isStandingListPreset(key: string | null | undefined): boolean {
  return (
    !!key &&
    (STANDING_LIST_PRESET_KEYS as readonly string[]).includes(key)
  );
}
