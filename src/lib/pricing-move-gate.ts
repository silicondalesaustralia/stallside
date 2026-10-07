import { isV2026Owner } from "@/lib/fee-v2026";

/** What the seller must confirm before an action moves them to V2026. */
export type PricingMoveNotice = "none" | "pricing" | "lifetime";

export function pricingMoveNotice(owner: {
  pricingModel?: string | null;
  lifetimeAccess?: boolean | null;
}): PricingMoveNotice {
  if (isV2026Owner(owner)) return "none";
  return owner.lifetimeAccess ? "lifetime" : "pricing";
}

export const CONFIRM_PRICING_FIELD = "confirmPricing";
export const CONFIRM_LIFETIME_FIELD = "confirmLifetimeEnd";

/** True when the submitted form carries every confirmation the notice needs. */
export function pricingMoveConfirmed(
  notice: PricingMoveNotice,
  formData: FormData,
): boolean {
  if (notice === "none") return true;
  if (formData.get(CONFIRM_PRICING_FIELD) !== "1") return false;
  if (notice === "lifetime" && formData.get(CONFIRM_LIFETIME_FIELD) !== "1") {
    return false;
  }
  return true;
}
