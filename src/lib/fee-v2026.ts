import {
  PRO_OVERAGE_BPS,
  PRO_STRIPE_ALLOWANCE_CENTS,
  STRIPE_FIXED_FEE_CENTS,
} from "@/lib/constants";

export type FeeRail = "stripe" | "square" | "paypal";

export type PricingModelOwner = { pricingModel?: string | null };

export function isV2026Owner(owner: PricingModelOwner): boolean {
  return owner.pricingModel === "V2026";
}

export function stripeFixedFeeCents(currency: string): number {
  return STRIPE_FIXED_FEE_CENTS[currency.trim().toUpperCase()] ?? 30;
}

/** 0.5% on the part of this order that pushes month Stripe sales past the allowance. */
export function proOverageFeeCents(
  orderCents: number,
  monthStripeVolumeCents: number,
): number {
  if (orderCents <= 0) return 0;
  const before = Math.max(0, monthStripeVolumeCents);
  const after = before + orderCents;
  const over = after - Math.max(before, PRO_STRIPE_ALLOWANCE_CENTS);
  if (over <= 0) return 0;
  return Math.round((over * PRO_OVERAGE_BPS) / 10_000);
}
