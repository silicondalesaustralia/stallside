import { revalidatePath } from "next/cache";
import { upsellInput, type UpsellInputValues } from "@/contracts/mobile/upsells";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { error: string };
export type UpsellSaveResult = { ok: true; id: string } | { error: string };
const NOT_FOUND = { error: "Upsell not found." } as const;

function parsePriceCents(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 && value <= 100000 ? Math.round(value * 100) : "invalid";
}

/**
 * Creates (id null) or updates an upsell. New upsells belong to `newStandId`
 * (the business the owner has selected); updates keep their business.
 */
export async function saveOwnerUpsell(
  ownerId: string,
  id: string | null,
  input: UpsellInputValues,
  newStandId: string | null | undefined,
): Promise<UpsellSaveResult> {
  const parsed = upsellInput.safeParse(input);
  if (!parsed.success || !parsed.data.name || !parsed.data.offerProductId) {
    return { error: "Give the upsell a name and pick the product to offer." };
  }
  const d = parsed.data;
  if (!d.sitewide && d.categoryIds.length === 0 && d.productIds.length === 0) {
    return { error: "Choose where it shows: everywhere, some categories or some products." };
  }
  if (!d.showOnWebsite && !d.showAtStall) return { error: "Turn on the online store, the stall checkout or both." };
  const priceCents = parsePriceCents(d.price);
  if (priceCents === "invalid") return { error: "Enter the special price as a number, like 4.50." };

  const existing = id
    ? await prisma.upsell.findFirst({ where: { id, ownerId }, select: { standId: true } })
    : null;
  if (id && !existing) return NOT_FOUND;
  const standId = existing?.standId ?? newStandId;
  if (!standId) return { error: "Create a business first." };

  const [offer, categories, products] = await Promise.all([
    prisma.product.findFirst({ where: { id: d.offerProductId, standId, isArchived: false }, select: { id: true } }),
    prisma.category.findMany({ where: { id: { in: d.categoryIds }, ownerId }, select: { id: true } }),
    prisma.product.findMany({ where: { id: { in: d.productIds }, standId }, select: { id: true } }),
  ]);
  if (!offer) return { error: "That product isn't available to offer." };

  const data = {
    name: d.name,
    offerProductId: offer.id,
    priceCents,
    isActive: d.isActive,
    sitewide: d.sitewide,
    categoryIds: categories.map((c) => c.id),
    productIds: products.map((p) => p.id),
    showOnWebsite: d.showOnWebsite,
    showAtStall: d.showAtStall,
  };
  try {
    const saved = id
      ? await prisma.upsell.update({ where: { id }, data, select: { id: true } })
      : await prisma.upsell.create({ data: { ...data, ownerId, standId }, select: { id: true } });
    revalidatePath("/dashboard/upsells");
    return { ok: true, id: saved.id };
  } catch (err) {
    console.error("[upsells] save failed", err instanceof Error ? err.message : err);
    return { error: "Could not save the upsell. Please try again." };
  }
}

/** Quick on/off without touching the rest of the upsell. */
export async function setOwnerUpsellActive(ownerId: string, id: string, isActive: boolean): Promise<Result> {
  const { count } = await prisma.upsell.updateMany({ where: { id, ownerId }, data: { isActive } });
  if (count === 0) return NOT_FOUND;
  revalidatePath("/dashboard/upsells");
  return { ok: true };
}

export async function deleteOwnerUpsell(ownerId: string, id: string): Promise<Result> {
  const upsell = await prisma.upsell.findFirst({ where: { id, ownerId }, select: { id: true } });
  if (!upsell) return NOT_FOUND;
  try {
    await prisma.upsell.delete({ where: { id: upsell.id } });
  } catch (err) {
    console.error("[upsells] delete failed", err instanceof Error ? err.message : err);
    return { error: "Could not delete the upsell. Please try again." };
  }
  revalidatePath("/dashboard/upsells");
  return { ok: true };
}
