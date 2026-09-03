import type { Promotion } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GROW_ORDER_STATUSES } from "@/lib/grow/segments";
import {
  activeWindow,
  computePromotionDiscount,
  type PromoEvalResult,
} from "@/lib/grow/promotion-calc";

export {
  computePromotionDiscount,
  type PromoEvalInput,
  type PromoEvalResult,
} from "@/lib/grow/promotion-calc";

export async function evaluatePromotionCode(input: {
  ownerId: string;
  code: string;
  subtotalCents: number;
  productIds: string[];
  customerEmail?: string | null;
  customerId?: string | null;
}): Promise<PromoEvalResult | { error: string }> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { error: "Enter a code" };

  const promo = await prisma.promotion.findFirst({
    where: { ownerId: input.ownerId, code },
  });
  if (!promo) return { error: "Code not found" };
  if (!activeWindow(promo, new Date())) {
    return { error: "This code is not active" };
  }

  let isFirstOrder = true;
  if (input.customerEmail) {
    const prior = await prisma.order.count({
      where: {
        ownerId: input.ownerId,
        receiptEmail: input.customerEmail.trim().toLowerCase(),
        paymentStatus: { in: GROW_ORDER_STATUSES },
      },
    });
    isFirstOrder = prior === 0;
  }

  if (promo.perCustomerLimit > 0 && (input.customerEmail || input.customerId)) {
    const used = await prisma.order.count({
      where: {
        ownerId: input.ownerId,
        promotionId: promo.id,
        paymentStatus: { in: GROW_ORDER_STATUSES },
        OR: [
          input.customerId ? { customerId: input.customerId } : undefined,
          input.customerEmail
            ? { receiptEmail: input.customerEmail.trim().toLowerCase() }
            : undefined,
        ].filter(Boolean) as object[],
      },
    });
    if (used >= promo.perCustomerLimit) {
      return { error: "You've already used this code" };
    }
  }

  const productIds = input.productIds;
  if (promo.categoryIds.length > 0) {
    const links = await prisma.productCategory.findMany({
      where: {
        categoryId: { in: promo.categoryIds },
        category: { ownerId: input.ownerId },
      },
      select: { productId: true },
    });
    const allowed = new Set(links.map((l) => l.productId));
    if (!productIds.some((id) => allowed.has(id))) {
      return { error: "Code not valid for these items" };
    }
  }
  if (promo.menuIds.length > 0) {
    const items = await prisma.menuProduct.findMany({
      where: { menuId: { in: promo.menuIds }, menu: { ownerId: input.ownerId } },
      select: { productId: true },
    });
    const allowed = new Set(items.map((i) => i.productId));
    if (!productIds.some((id) => allowed.has(id))) {
      return { error: "Code not valid for these items" };
    }
  }

  const discountCents = computePromotionDiscount(promo as Promotion, {
    subtotalCents: input.subtotalCents,
    productIds,
    isFirstOrder,
  });
  if (discountCents <= 0 && promo.type !== "FREE_DELIVERY") {
    return { error: "Order doesn't meet this code's minimum" };
  }

  return {
    discountCents,
    label: promo.name || `Promo ${promo.code}`,
    promotionId: promo.id,
    code: promo.code,
  };
}

export async function incrementPromotionUsage(promotionId: string) {
  await prisma.promotion.update({
    where: { id: promotionId },
    data: { usageCount: { increment: 1 } },
  });
}
