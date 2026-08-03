import {
  STALLSIDE_FEE_BPS,
  STALLSIDE_FEE_FIXED_CENTS,
} from "@/lib/constants";

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function dollarsToCents(value: string | number): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(n * 100);
}

export function platformFeeCents(orderTotalCents: number, bps: number): number {
  return Math.round((orderTotalCents * bps) / 10_000);
}

/** Stallside fee: 2.5% + 30¢ (Free plan Stripe sales only). */
export function stallsideFeeCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return (
    Math.round((amountCents * STALLSIDE_FEE_BPS) / 10_000) +
    STALLSIDE_FEE_FIXED_CENTS
  );
}
