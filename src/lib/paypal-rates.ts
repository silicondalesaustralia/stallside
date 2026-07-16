/**
 * Estimated PayPal online Goods & Services rates for owner reference.
 * VERIFY against PayPal merchant fees per market before showing to owners.
 * Online redirect checkout ≠ in-person QR / Zettle rates.
 */
export type PayPalRateRow = {
  currency: string;
  /** Human-readable estimate; empty until verified with PayPal. */
  estimateLabel: string;
  verified: boolean;
};

export const PAYPAL_RATES: PayPalRateRow[] = [
  { currency: "AUD", estimateLabel: "", verified: false },
  { currency: "USD", estimateLabel: "", verified: false },
  { currency: "GBP", estimateLabel: "", verified: false },
  { currency: "EUR", estimateLabel: "", verified: false },
  { currency: "CAD", estimateLabel: "", verified: false },
  { currency: "NZD", estimateLabel: "", verified: false },
];

export function paypalRateForCurrency(currency: string): PayPalRateRow | null {
  const code = currency.toUpperCase();
  return PAYPAL_RATES.find((r) => r.currency === code) ?? null;
}

/** Only return a display string when the row is marked verified. */
export function paypalFeeDisplay(currency: string): string | null {
  const row = paypalRateForCurrency(currency);
  if (!row?.verified || !row.estimateLabel) return null;
  return row.estimateLabel;
}
