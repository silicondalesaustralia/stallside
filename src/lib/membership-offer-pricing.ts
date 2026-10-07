import { formatMoney } from "@/lib/money";
import type { MembershipPlan } from "@/lib/subscription-offer";

export function membershipHeroPrice(input: {
  currency: string;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
}): { amount: string; suffix: string } | null {
  if (input.weeklyPriceCents != null && input.weeklyPriceCents > 0) {
    return {
      amount: formatMoney(input.weeklyPriceCents, input.currency),
      suffix: "/ week",
    };
  }
  if (input.monthlyPriceCents != null && input.monthlyPriceCents > 0) {
    return {
      amount: formatMoney(input.monthlyPriceCents, input.currency),
      suffix: "/ month",
    };
  }
  if (input.upfrontPriceCents != null && input.upfrontPriceCents > 0) {
    return {
      amount: formatMoney(input.upfrontPriceCents, input.currency),
      suffix: " upfront",
    };
  }
  return null;
}

export function membershipValueLine(input: {
  currency: string;
  termWeeks: number | null;
  weeklyPriceCents: number | null;
  upfrontPriceCents: number | null;
}): string | null {
  if (
    input.termWeeks == null ||
    input.termWeeks < 1 ||
    input.upfrontPriceCents == null ||
    input.upfrontPriceCents <= 0
  ) {
    return null;
  }
  const upfront = formatMoney(input.upfrontPriceCents, input.currency);
  if (
    input.weeklyPriceCents != null &&
    input.weeklyPriceCents > 0 &&
    Math.abs(
      input.weeklyPriceCents * input.termWeeks - input.upfrontPriceCents,
    ) <= 100
  ) {
    return `${input.termWeeks} weeks for ${upfront} when paid upfront`;
  }
  return `${upfront} when paid upfront`;
}

export function membershipPlanIntervalLabel(
  plan: MembershipPlan,
  termWeeks: number | null,
): string {
  switch (plan) {
    case "WEEKLY":
      return "Per week";
    case "MONTHLY":
      return "Per month";
    case "UPFRONT":
      return termWeeks != null && termWeeks > 0
        ? `${termWeeks} weeks`
        : "Full term";
    default:
      return "";
  }
}

export function membershipSelectedSummary(
  plan: MembershipPlan,
  priceCents: number,
  currency: string,
): string {
  const amount = formatMoney(priceCents, currency);
  switch (plan) {
    case "WEEKLY":
      return `Selected payment: ${amount} weekly`;
    case "MONTHLY":
      return `Selected payment: ${amount} monthly`;
    case "UPFRONT":
      return `Selected payment: ${amount} upfront`;
    default:
      return `Selected payment: ${amount}`;
  }
}

/** Split upfront benefits into bullet lines + optional footnote. */
export function parseUpfrontBenefits(raw: string | null | undefined): {
  bullets: string[];
  footnote: string | null;
} {
  const text = (raw ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return { bullets: [], footnote: null };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];
  const footnoteParts: string[] = [];

  for (const line of lines) {
    if (/^[•\-*]/.test(line)) {
      bullets.push(line.replace(/^[•\-*]\s*/, ""));
      continue;
    }
    if (bullets.length > 0 || /^discounts?\s+apply/i.test(line)) {
      footnoteParts.push(line);
    }
  }

  if (bullets.length === 0) {
    return { bullets: lines, footnote: null };
  }
  return {
    bullets,
    footnote: footnoteParts.length > 0 ? footnoteParts.join(" ") : null,
  };
}
