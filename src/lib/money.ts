import { STALLSIDE_FEE_BPS } from "@/lib/constants";

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

/** Stallside platform fee: 2.5% of amount (Free plan Stripe sales only). */
export function stallsideFeeCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return Math.round((amountCents * STALLSIDE_FEE_BPS) / 10_000);
}

/**
 * Exact gross-up when passing the Stallside fee to the customer:
 * charge = round(subtotal / (1 - 0.025)).
 */
export function stallsidePassOnChargeCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  const keepRate = 1 - STALLSIDE_FEE_BPS / 10_000;
  return Math.round(subtotalCents / keepRate);
}

/** Pass-on fee line = charged total − order subtotal. */
export function stallsidePassOnFeeCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return Math.max(0, stallsidePassOnChargeCents(subtotalCents) - subtotalCents);
}
