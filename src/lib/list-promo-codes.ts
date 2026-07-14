import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { formatMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export type PromoRow = {
  id: string;
  code: string;
  active: boolean;
  summary: string;
};

function couponSummary(coupon: string | Stripe.Coupon): string {
  if (typeof coupon === "string") return coupon;
  if (coupon.percent_off != null) {
    return `${coupon.percent_off}% off · ${coupon.duration}`;
  }
  if (coupon.amount_off != null) {
    return `${formatMoney(coupon.amount_off, DEFAULT_CURRENCY)} off · ${coupon.duration}`;
  }
  return coupon.duration;
}

export async function listPromoCodes(): Promise<PromoRow[]> {
  const list = await getStripe().promotionCodes.list({
    limit: 30,
    expand: ["data.promotion.coupon"],
  });

  return list.data.map((p) => {
    const coupon = p.promotion.coupon;
    return {
      id: p.id,
      code: p.code,
      active: p.active,
      summary: coupon ? couponSummary(coupon) : p.promotion.type,
    };
  });
}
