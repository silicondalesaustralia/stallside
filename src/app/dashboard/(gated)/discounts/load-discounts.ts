import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PaymentStatus, type Promotion } from "@/generated/prisma/client";
import { dateKeyInTimeZone } from "@/lib/utils/australiaSydneyTime";
import type { DiscountInput } from "./discount-input";
import type { DiscountRow } from "./DiscountList";

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function discountValueLabel(p: Pick<Promotion, "type" | "percentOff" | "amountOffCents">, currency: string) {
  if (p.type === "FREE_DELIVERY") return "Free shipping";
  if (p.type === "PERCENT_OFF") return `${p.percentOff ?? 0}% off`;
  return `${formatMoney(p.amountOffCents ?? 0, currency)} off`;
}

function status(p: Promotion, used: number): string | null {
  const now = new Date();
  if (!p.isActive) return "Off";
  if (p.startsAt && p.startsAt > now) return "Scheduled";
  if (p.endsAt && p.endsAt < now) return "Expired";
  if (p.usageLimit != null && used >= p.usageLimit) return "Used up";
  return null;
}

/** Discount codes for one business, including codes that apply to every business. */
export async function loadDiscountRows(ownerId: string, standId: string, currency: string): Promise<DiscountRow[]> {
  const promos = await prisma.promotion.findMany({
    where: { ownerId, OR: [{ standId }, { standId: null }] },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          orders: { where: { paymentStatus: { in: [PaymentStatus.CUSTOMER_CONFIRMED, PaymentStatus.PAID] } } },
        },
      },
    },
  });
  return promos.map((p) => {
    const used = p._count.orders;
    const scope =
      p.categoryIds.length === 0 && p.productIds.length === 0
        ? "Whole order"
        : [
            p.categoryIds.length ? count(p.categoryIds.length, "category", "categories") : "",
            p.productIds.length ? count(p.productIds.length, "product", "products") : "",
          ]
            .filter(Boolean)
            .join(", ");
    const channels =
      p.showOnWebsite && p.showAtStall ? "Online and stall" : p.showOnWebsite ? "Online only" : "Stall only";
    return {
      id: p.id,
      code: p.code,
      name: p.name !== p.code ? p.name : null,
      summary: `${discountValueLabel(p, currency)} · ${scope} · ${channels}`,
      uses: p.usageLimit != null ? `${used} of ${p.usageLimit} used` : count(used, "use", "uses"),
      status: status(p, used),
    };
  });
}

export function discountToInput(p: Promotion, timeZone: string): DiscountInput {
  const value =
    p.type === "PERCENT_OFF"
      ? String(p.percentOff ?? "")
      : p.type === "FIXED_OFF" && p.amountOffCents != null
        ? (p.amountOffCents / 100).toFixed(2)
        : "";
  return {
    code: p.code,
    name: p.name === p.code ? "" : p.name,
    type: p.type,
    value,
    minOrder: p.minOrderCents > 0 ? (p.minOrderCents / 100).toFixed(2) : "",
    wholeOrder: p.categoryIds.length === 0 && p.productIds.length === 0,
    categoryIds: p.categoryIds,
    productIds: p.productIds,
    showOnWebsite: p.showOnWebsite,
    showAtStall: p.showAtStall,
    startsOn: p.startsAt ? dateKeyInTimeZone(p.startsAt, timeZone) : "",
    endsOn: p.endsAt ? dateKeyInTimeZone(p.endsAt, timeZone) : "",
    usageLimit: p.usageLimit != null ? String(p.usageLimit) : "",
    perCustomerLimit: p.perCustomerLimit > 0 ? String(p.perCustomerLimit) : "",
    firstOrderOnly: p.firstOrderOnly,
    isActive: p.isActive,
  };
}
