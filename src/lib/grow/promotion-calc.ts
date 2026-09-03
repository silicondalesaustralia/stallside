import type { Promotion, PromotionType } from "@/generated/prisma/client";

export type PromoEvalInput = {
  subtotalCents: number;
  productIds: string[];
  customerEmail?: string | null;
  customerId?: string | null;
  isFirstOrder?: boolean;
};

export type PromoEvalResult = {
  discountCents: number;
  label: string;
  promotionId: string;
  code: string;
};

export function activeWindow(p: Promotion, now: Date): boolean {
  if (!p.isActive) return false;
  if (p.startsAt && p.startsAt > now) return false;
  if (p.endsAt && p.endsAt < now) return false;
  if (p.usageLimit != null && p.usageCount >= p.usageLimit) return false;
  return true;
}

function eligibleProducts(p: Promotion, productIds: string[]): boolean {
  if (
    p.productIds.length === 0 &&
    p.categoryIds.length === 0 &&
    p.menuIds.length === 0
  ) {
    return true;
  }
  if (p.productIds.length > 0) {
    return productIds.some((id) => p.productIds.includes(id));
  }
  return true;
}

export function computePromotionDiscount(
  p: Promotion,
  input: PromoEvalInput,
): number {
  if (input.subtotalCents <= 0) return 0;
  if (input.subtotalCents < p.minOrderCents) return 0;
  if (p.firstOrderOnly && !input.isFirstOrder) return 0;
  if (!eligibleProducts(p, input.productIds)) return 0;

  const type = p.type as PromotionType;
  if (type === "PERCENT_OFF") {
    const pct = Math.min(100, Math.max(0, p.percentOff ?? 0));
    return Math.min(
      input.subtotalCents,
      Math.round((input.subtotalCents * pct) / 100),
    );
  }
  if (type === "FIXED_OFF") {
    return Math.min(input.subtotalCents, Math.max(0, p.amountOffCents ?? 0));
  }
  return 0;
}
