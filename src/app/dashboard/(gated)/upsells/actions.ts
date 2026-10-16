"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  offerProductId: z.string().min(1),
  price: z.string().trim().max(12),
  isActive: z.boolean(),
  sitewide: z.boolean(),
  categoryIds: z.array(z.string().min(1)).max(500),
  productIds: z.array(z.string().min(1)).max(2000),
  showOnWebsite: z.boolean(),
  showAtStall: z.boolean(),
});

export type UpsellInput = z.infer<typeof schema>;
export type UpsellActionResult = { error: string } | { ok: true };

function parsePriceCents(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 && value <= 100000 ? Math.round(value * 100) : "invalid";
}

/** Creates (id null) or updates an upsell for the selected business. */
export async function saveUpsell(id: string | null, input: UpsellInput): Promise<UpsellActionResult> {
  const { owner } = await requireOwnerWrite();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Give the upsell a name and pick the product to offer." };
  const d = parsed.data;
  if (!d.sitewide && d.categoryIds.length === 0 && d.productIds.length === 0) {
    return { error: "Choose where it shows: everywhere, some categories or some products." };
  }
  if (!d.showOnWebsite && !d.showAtStall) return { error: "Turn on the online store, the stall checkout or both." };
  const priceCents = parsePriceCents(d.price);
  if (priceCents === "invalid") return { error: "Enter the special price as a number, like 4.50." };

  const existing = id
    ? await prisma.upsell.findFirst({ where: { id, ownerId: owner.id }, select: { standId: true } })
    : null;
  if (id && !existing) return { error: "Upsell not found." };
  const standId = existing?.standId ?? (await resolveSelectedBusiness(owner.id)).selected?.id;
  if (!standId) return { error: "Create a business first." };

  const [offer, categories, products] = await Promise.all([
    prisma.product.findFirst({ where: { id: d.offerProductId, standId, isArchived: false }, select: { id: true } }),
    prisma.category.findMany({ where: { id: { in: d.categoryIds }, ownerId: owner.id }, select: { id: true } }),
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
    if (id) await prisma.upsell.update({ where: { id }, data });
    else await prisma.upsell.create({ data: { ...data, ownerId: owner.id, standId } });
  } catch (err) {
    console.error("[upsells] save failed", err instanceof Error ? err.message : err);
    return { error: "Could not save the upsell. Please try again." };
  }
  revalidatePath("/dashboard/upsells");
  redirect("/dashboard/upsells");
}

export async function deleteUpsell(id: string): Promise<UpsellActionResult> {
  const { owner } = await requireOwnerWrite();
  const upsell = await prisma.upsell.findFirst({ where: { id, ownerId: owner.id }, select: { id: true } });
  if (!upsell) return { error: "Upsell not found." };
  try {
    await prisma.upsell.delete({ where: { id: upsell.id } });
  } catch (err) {
    console.error("[upsells] delete failed", err instanceof Error ? err.message : err);
    return { error: "Could not delete the upsell. Please try again." };
  }
  revalidatePath("/dashboard/upsells");
  redirect("/dashboard/upsells");
}
