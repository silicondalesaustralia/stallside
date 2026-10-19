import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import {
  computeCodeDiscount,
  normalizeDiscountCode,
  type DiscountLine,
} from "./compute";

export type DiscountChannel = "website" | "stall";

export type ResolvedCode = {
  promotionId: string;
  code: string;
  label: string;
  discountCents: number;
  freeShipping: boolean;
};

type ResolveInput = {
  ownerId: string;
  standId: string;
  currency: string;
  rawCode: string;
  email: string;
  lines: DiscountLine[];
  channel?: DiscountChannel;
  hasPriorOrder: () => Promise<boolean>;
  /** Cart preview before the shopper has typed an email; checkout re-checks. */
  emailOptional?: boolean;
};

const PAID = [PaymentStatus.CUSTOMER_CONFIRMED, PaymentStatus.PAID];
const INVALID = "That discount code isn't valid.";

export async function resolveDiscountCode(
  input: ResolveInput,
): Promise<ResolvedCode | { error: string }> {
  const code = normalizeDiscountCode(input.rawCode);
  if (!code) return { error: INVALID };
  const promo = await prisma.promotion.findUnique({
    where: { ownerId_code: { ownerId: input.ownerId, code } },
  });
  if (!promo || !promo.isActive) return { error: INVALID };
  if (promo.standId && promo.standId !== input.standId) return { error: INVALID };
  if (input.channel === "website" && !promo.showOnWebsite) return { error: INVALID };
  if (input.channel === "stall" && !promo.showAtStall) return { error: INVALID };

  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) return { error: "That code isn't active yet." };
  if (promo.endsAt && promo.endsAt < now) return { error: "That code has expired." };

  if (promo.usageLimit != null) {
    const used = await prisma.order.count({
      where: { promotionId: promo.id, paymentStatus: { in: PAID } },
    });
    if (used >= promo.usageLimit) return { error: "That code has been fully used." };
  }
  if (promo.firstOrderOnly || promo.perCustomerLimit > 0) {
    if (promo.firstOrderOnly && !input.email && !input.emailOptional) {
      return { error: "Enter your email to use this first-order code." };
    }
    if (promo.firstOrderOnly && input.email && (await input.hasPriorOrder())) {
      return { error: "That code is for first orders only." };
    }
    if (input.email && promo.perCustomerLimit > 0) {
      const mine = await prisma.order.count({
        where: {
          promotionId: promo.id,
          paymentStatus: { in: PAID },
          receiptEmail: { equals: input.email, mode: "insensitive" },
        },
      });
      if (mine >= promo.perCustomerLimit) return { error: "You've already used that code." };
    }
  }

  const scopeProductIds = await expandScope(promo.productIds, promo.categoryIds);
  const result = computeCodeDiscount(
    {
      type: promo.type,
      percentOff: promo.percentOff,
      amountOffCents: promo.amountOffCents,
      minOrderCents: promo.minOrderCents,
      scopeProductIds,
    },
    input.lines,
  );
  if (!result.ok) {
    return {
      error:
        result.reason === "min_order"
          ? `Spend ${formatMoney(promo.minOrderCents, input.currency)} or more to use that code.`
          : "That code doesn't apply to anything in your cart.",
    };
  }
  return {
    promotionId: promo.id,
    code,
    label: `Code ${code}`,
    discountCents: result.discountCents,
    freeShipping: result.freeShipping,
  };
}

async function expandScope(productIds: string[], categoryIds: string[]): Promise<string[]> {
  if (categoryIds.length === 0) return productIds;
  const links = await prisma.productCategory.findMany({
    where: { categoryId: { in: categoryIds } },
    select: { productId: true },
  });
  const ids = new Set([...productIds, ...links.map((l) => l.productId)]);
  return ids.size > 0 ? [...ids] : ["__none__"];
}
