export type FeeRail = "stripe" | "square" | "paypal";

export type PricingModelOwner = { pricingModel?: string | null };

export function isV2026Owner(owner: PricingModelOwner): boolean {
  return owner.pricingModel === "V2026";
}
