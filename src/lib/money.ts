import { STALLSIDE_FEE_BPS } from "@/lib/constants";

/** Stable locale per currency so SSR and browser agree (undefined locale varies by region). */
export function moneyFormatLocale(currency: string): string {
  switch (currency.trim().toUpperCase()) {
    case "USD":
      return "en-US";
    case "GBP":
      return "en-GB";
    case "EUR":
      return "en-IE";
    case "CAD":
      return "en-CA";
    case "NZD":
      return "en-NZ";
    default:
      return "en-AU";
  }
}

export function formatMoney(cents: number, currency: string): string {
  const code = currency.trim().toUpperCase();
  return new Intl.NumberFormat(moneyFormatLocale(code), {
    style: "currency",
    currency: code,
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

/** Vendl platform fee: 2.5% of amount (Free plan Stripe sales only). */
export function stallsideFeeCents(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return Math.round((amountCents * STALLSIDE_FEE_BPS) / 10_000);
}

/**
 * Exact gross-up when passing the Vendl fee to the customer:
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
