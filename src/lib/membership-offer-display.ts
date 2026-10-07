import type { MembershipPlan } from "@/lib/subscription-offer";

export type MembershipFact = { main: string; label: string };

/** Prefer short narrative lines; drop price/retail sentences when present. */
export function membershipIntroCopy(
  description: string | null | undefined,
): string | null {
  const text = description?.trim() ?? "";
  if (!text) return null;
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const kept = parts.filter(
    (p) => !/member price|paid upfront|standard retail|\$\d/i.test(p),
  );
  const use = kept.length > 0 ? kept : parts.slice(0, 1);
  return use.join(" ").trim() || null;
}

export function membershipPlansHowSummary(plans: MembershipPlan[]): string {
  const labels = plans.map((p) => {
    if (p === "WEEKLY") return "weekly";
    if (p === "MONTHLY") return "monthly";
    return "all upfront";
  });
  if (labels.length === 0) return "Choose a payment plan.";
  if (labels.length === 1) {
    const only = labels[0]!;
    return only.charAt(0).toUpperCase() + only.slice(1) + ".";
  }
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}.`;
  return `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}.`;
}

/** Optional share size from free-text description (e.g. "1 litre", "500 mL"). */
export function shareAmountFromDescription(
  description: string | null | undefined,
): string | null {
  const text = description?.trim() ?? "";
  if (!text) return null;
  const match = text.match(
    /(\d+(?:\.\d+)?\s*(?:mL|ml|ML|litres?|liters?|L)\b)/i,
  );
  return match?.[1]?.replace(/\s+/g, " ") ?? null;
}

export function membershipFacts(input: {
  description: string | null;
  termWeeks: number | null;
  collectionWeekdayLabel: string | null;
  handoverCollect: boolean;
}): MembershipFact[] {
  const facts: MembershipFact[] = [];
  const share = shareAmountFromDescription(input.description);
  if (share) {
    facts.push({ main: share, label: "Every week" });
  } else {
    facts.push({ main: "Weekly", label: "Your share" });
  }
  if (input.termWeeks != null && input.termWeeks > 0) {
    facts.push({
      main: `${input.termWeeks} weeks`,
      label: "One membership",
    });
  }
  if (input.collectionWeekdayLabel) {
    facts.push({
      main: input.collectionWeekdayLabel,
      label: input.handoverCollect ? "Farm collection" : "Delivery day",
    });
  }
  return facts;
}
