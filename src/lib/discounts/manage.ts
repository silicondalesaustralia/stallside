import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { discountToInput } from "@/lib/discounts/load";

type Result = { ok: true } | { error: string };

/** The discount as form values, plus the business it belongs to. */
export async function getOwnerDiscount(ownerId: string, id: string) {
  const promo = await prisma.promotion.findFirst({
    where: { id, ownerId },
    include: { stand: { select: { timezone: true, currency: true } } },
  });
  if (!promo) return null;
  return {
    id: promo.id,
    standId: promo.standId,
    currency: promo.stand?.currency ?? null,
    input: discountToInput(promo, promo.stand?.timezone || "Australia/Sydney"),
  };
}

/** Quick on/off without touching the rest of the code's settings. */
export async function setOwnerDiscountActive(ownerId: string, id: string, isActive: boolean): Promise<Result> {
  const { count } = await prisma.promotion.updateMany({ where: { id, ownerId }, data: { isActive } });
  if (count === 0) return { error: "Discount not found." };
  revalidatePath("/dashboard/discounts");
  return { ok: true };
}

export async function deleteOwnerDiscount(ownerId: string, id: string): Promise<Result> {
  const promo = await prisma.promotion.findFirst({ where: { id, ownerId }, select: { id: true } });
  if (!promo) return { error: "Discount not found." };
  try {
    await prisma.promotion.delete({ where: { id: promo.id } });
  } catch (err) {
    console.error("[discounts] delete failed", err instanceof Error ? err.message : err);
    return { error: "Could not delete the discount. Please try again." };
  }
  revalidatePath("/dashboard/discounts");
  return { ok: true };
}
