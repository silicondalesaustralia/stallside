/** Which ways a pre-order can be paid. Client-safe (no Prisma). */

import type { PreOrderPaymentTiming } from "@/lib/pre-order";

/** Display and default order: the first allowed option is the default at checkout. */
export const PRE_ORDER_PAY_OPTIONS: readonly PreOrderPaymentTiming[] = [
  "PAY_UPFRONT",
  "DEPOSIT_THEN_BALANCE",
  "PAY_AT_PICKUP",
];

export const CARD_PAY_OPTIONS: readonly PreOrderPaymentTiming[] = [
  "PAY_UPFRONT",
  "DEPOSIT_THEN_BALANCE",
];

export type CardPayTiming = "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";

export function isPreOrderPayOption(value: unknown): value is PreOrderPaymentTiming {
  return PRE_ORDER_PAY_OPTIONS.includes(value as PreOrderPaymentTiming);
}

/** Dedupe and sort into display order. */
export function sortPayOptions(values: readonly unknown[]): PreOrderPaymentTiming[] {
  return PRE_ORDER_PAY_OPTIONS.filter((option) => values.includes(option));
}

/**
 * Allowed options for a pre-order product or page. Rows saved before multi-choice
 * have an empty list, so they fall back to their single `paymentTiming`.
 */
export function payOptionsOf(p: {
  paymentTiming: string;
  paymentOptions?: readonly string[] | null;
}): PreOrderPaymentTiming[] {
  const list = sortPayOptions(p.paymentOptions ?? []);
  if (list.length) return list;
  return [isPreOrderPayOption(p.paymentTiming) ? p.paymentTiming : "PAY_UPFRONT"];
}

export function payOptionsKey(options: readonly PreOrderPaymentTiming[]): string {
  return sortPayOptions(options).join(",");
}

/** Checked boxes (`paymentOptions`), else the older single `paymentTiming` field. */
export function payOptionsFromForm(formData: FormData): PreOrderPaymentTiming[] {
  const checked = formData.getAll("paymentOptions").map(String);
  if (checked.length) return sortPayOptions(checked);
  const single = formData.get("paymentTiming");
  if (single === "PAY_NOW") return ["PAY_UPFRONT"];
  return isPreOrderPayOption(single) ? [single] : [];
}

/** Rules every pre-order save follows (web forms and the app); returns an error message or null. */
export function payOptionsError(input: {
  options: readonly PreOrderPaymentTiming[];
  handoverMode: "COLLECT" | "DELIVER";
  cardAllowed: boolean;
}): string | null {
  if (!input.options.length) return "Choose at least one way for customers to pay.";
  if (input.options.includes("PAY_AT_PICKUP") && input.handoverMode === "DELIVER") {
    return "Pay at pickup only works when customers collect. Choose Collect at a place.";
  }
  if (!input.cardAllowed && input.options.some((o) => CARD_PAY_OPTIONS.includes(o))) {
    return "Connect Stripe or Square to take card payments, or choose Pay at pickup only.";
  }
  return null;
}

/** Whole 1-99 deposit percent, or an error message. */
export function depositPercentOf(raw: number): { ok: true; value: number } | { ok: false; error: string } {
  if (!Number.isFinite(raw) || raw < 1 || raw > 99) {
    return { ok: false, error: "Deposit percent must be between 1 and 99." };
  }
  return { ok: true, value: Math.round(raw) };
}

export function payOptionLabel(option: PreOrderPaymentTiming, depositPercent: number | null): string {
  if (option === "DEPOSIT_THEN_BALANCE") return `Pay a ${depositPercent ?? 30}% deposit now`;
  if (option === "PAY_AT_PICKUP") return "Pay at pickup";
  return "Pay in full now";
}
