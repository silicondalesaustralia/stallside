"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { normalizeDiscountCode } from "@/lib/discounts/compute";
import { localDateTimeToUtc } from "@/lib/utils/australiaSydneyTime";
import { discountSchema, parseCount, parseMoneyCents, type DiscountInput } from "./discount-input";

export type DiscountActionResult = { error: string } | { ok: true };

/** Creates (id null) or updates a discount code for the selected business. */
export async function saveDiscount(id: string | null, input: DiscountInput): Promise<DiscountActionResult> {
  const { owner } = await requireOwnerWrite();
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a code of at least 2 characters." };
  const d = parsed.data;
  const code = normalizeDiscountCode(d.code);
  if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return { error: "Codes can use letters, numbers, - and _ only." };
  if (!d.wholeOrder && d.categoryIds.length === 0 && d.productIds.length === 0) {
    return { error: "Pick at least one category or product, or apply it to the whole order." };
  }
  if (!d.showOnWebsite && !d.showAtStall) return { error: "Turn on the online store, the stall checkout or both." };

  const percent = d.type === "PERCENT_OFF" ? Number(d.value) : null;
  if (percent != null && !(Number.isInteger(percent) && percent >= 1 && percent <= 100)) {
    return { error: "Enter a percentage from 1 to 100." };
  }
  const amount = d.type === "FIXED_OFF" ? parseMoneyCents(d.value) : null;
  if (d.type === "FIXED_OFF" && (amount === null || amount === "invalid" || amount <= 0)) {
    return { error: "Enter the amount off, like 5.00." };
  }
  const minOrder = parseMoneyCents(d.minOrder);
  const usageLimit = parseCount(d.usageLimit);
  const perCustomer = parseCount(d.perCustomerLimit);
  if (minOrder === "invalid" || usageLimit === "invalid" || perCustomer === "invalid") {
    return { error: "Check the minimum spend and limits are whole numbers." };
  }
  if (d.startsOn && d.endsOn && d.endsOn < d.startsOn) return { error: "The end date is before the start date." };

  const existing = id
    ? await prisma.promotion.findFirst({ where: { id, ownerId: owner.id }, select: { standId: true } })
    : null;
  if (id && !existing) return { error: "Discount not found." };
  const standId = existing ? existing.standId : (await resolveSelectedBusiness(owner.id)).selected?.id;
  if (standId === undefined) return { error: "Create a business first." };
  const stand = standId
    ? await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id }, select: { timezone: true } })
    : null;
  const tz = stand?.timezone || "Australia/Sydney";

  const [categories, products] = d.wholeOrder
    ? [[], []]
    : await Promise.all([
        prisma.category.findMany({ where: { id: { in: d.categoryIds }, ownerId: owner.id }, select: { id: true } }),
        prisma.product.findMany({ where: { id: { in: d.productIds }, ownerId: owner.id }, select: { id: true } }),
      ]);

  const data = {
    code,
    name: d.name || code,
    type: d.type,
    percentOff: percent,
    amountOffCents: typeof amount === "number" ? amount : null,
    minOrderCents: minOrder ?? 0,
    startsAt: d.startsOn ? localDateTimeToUtc(d.startsOn, "00:00", tz) : null,
    endsAt: d.endsOn ? new Date(localDateTimeToUtc(d.endsOn, "23:59", tz).getTime() + 59_999) : null,
    usageLimit,
    perCustomerLimit: perCustomer ?? 0,
    categoryIds: categories.map((c) => c.id),
    productIds: products.map((p) => p.id),
    firstOrderOnly: d.firstOrderOnly,
    isActive: d.isActive,
    showOnWebsite: d.showOnWebsite,
    showAtStall: d.showAtStall,
  };
  try {
    if (id) await prisma.promotion.update({ where: { id }, data });
    else await prisma.promotion.create({ data: { ...data, ownerId: owner.id, standId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: `You already have a code called ${code}.` };
    }
    console.error("[discounts] save failed", err instanceof Error ? err.message : err);
    return { error: "Could not save the discount. Please try again." };
  }
  revalidatePath("/dashboard/discounts");
  redirect("/dashboard/discounts");
}

export async function deleteDiscount(id: string): Promise<DiscountActionResult> {
  const { owner } = await requireOwnerWrite();
  const promo = await prisma.promotion.findFirst({ where: { id, ownerId: owner.id }, select: { id: true } });
  if (!promo) return { error: "Discount not found." };
  try {
    await prisma.promotion.delete({ where: { id: promo.id } });
  } catch (err) {
    console.error("[discounts] delete failed", err instanceof Error ? err.message : err);
    return { error: "Could not delete the discount. Please try again." };
  }
  revalidatePath("/dashboard/discounts");
  redirect("/dashboard/discounts");
}
