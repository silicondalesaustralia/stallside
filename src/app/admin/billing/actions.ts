"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { getStripe, isStripeBillingConfigured } from "@/lib/stripe";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export async function createSignupCoupon(formData: FormData) {
  await requireAdmin();
  if (!isStripeBillingConfigured()) {
    throw new Error("Stripe Billing is not configured");
  }

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const percentOff = Number(formData.get("percentOff") ?? 0);
  const amountOffDollars = Number(formData.get("amountOff") ?? 0);
  const duration = String(formData.get("duration") ?? "once") as
    | "once"
    | "repeating"
    | "forever";
  const months = Number(formData.get("months") ?? 1);

  if (!code) throw new Error("Code required");
  if (!percentOff && !amountOffDollars) {
    throw new Error("Set percent off or amount off");
  }

  const stripe = getStripe();
  const coupon = await stripe.coupons.create({
    name: code,
    duration,
    ...(duration === "repeating" ? { duration_in_months: months || 1 } : {}),
    ...(percentOff > 0
      ? { percent_off: percentOff }
      : {
          amount_off: Math.round(amountOffDollars * 100),
          currency: DEFAULT_CURRENCY.toLowerCase(),
        }),
  });

  await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code,
    active: true,
  });

  revalidatePath("/admin/billing");
}
