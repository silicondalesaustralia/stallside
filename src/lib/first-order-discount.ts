/** First-order discount: stand-scoped, keyed on receipt email. */

export function normalizeReceiptEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function computeFirstOrderDiscount(input: {
  enabled: boolean;
  percent: number;
  amountCents: number | null;
  subtotalCents: number;
  /** Skip when cart already used tier pricing (no stacking). */
  usedTier: boolean;
}): { discountCents: number; label: string | null } {
  if (!input.enabled || input.usedTier || input.subtotalCents <= 0) {
    return { discountCents: 0, label: null };
  }
  let discountCents = 0;
  let label: string | null = null;
  if (input.amountCents != null && input.amountCents > 0) {
    discountCents = Math.min(input.amountCents, input.subtotalCents);
    label = "First-order discount";
  } else if (input.percent > 0 && input.percent <= 100) {
    discountCents = Math.floor((input.subtotalCents * input.percent) / 100);
    label = `First-order ${input.percent}% off`;
  }
  return { discountCents, label };
}
