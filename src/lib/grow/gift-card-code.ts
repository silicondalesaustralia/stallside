import crypto from "node:crypto";

/** High-entropy gift card code (seller-scoped unique). */
export function generateGiftCardCode(): string {
  const raw = crypto.randomBytes(8).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

/**
 * Checkout redemption deferred — payment-sensitive across Stripe/cash/PayPal.
 * Foundation issuance + ledger only in Phase 7.
 */
export const GIFT_CARD_CHECKOUT_REDEMPTION_DEFERRED = true;
