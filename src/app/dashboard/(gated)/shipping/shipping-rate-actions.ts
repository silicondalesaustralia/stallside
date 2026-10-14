"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { dollarsToCents } from "@/lib/money";
import { parseShippingMode } from "@/lib/shipping/shipping-cost";

function optionalCents(raw: FormDataEntryValue | null): number | null | "invalid" {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  try {
    const cents = dollarsToCents(text);
    return cents >= 0 ? cents : "invalid";
  } catch {
    return "invalid";
  }
}

/** Free, flat rate or per-product shipping, plus an optional free-over threshold. */
export async function saveShippingRates(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const mode = parseShippingMode(formData.get("shippingMode"));
  const flat = optionalCents(formData.get("shippingFlat"));
  const freeOver = optionalCents(formData.get("shippingFreeOver"));
  if (!mode || flat === "invalid" || freeOver === "invalid") redirect("/dashboard/shipping?rates=invalid");
  if (mode === "FLAT" && !flat) redirect("/dashboard/shipping?rates=flat");
  let slug = "";
  try {
    const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id }, select: { slug: true } });
    if (!stand) redirect("/dashboard/shipping?rates=invalid");
    await prisma.stand.update({
      where: { id: standId },
      data: { shippingMode: mode, shippingFlatCents: flat ?? 0, shippingFreeOverCents: freeOver },
    });
    slug = stand.slug;
  } catch (error) {
    unstable_rethrow(error);
    console.error("saveShippingRates failed", error);
    redirect("/dashboard/shipping?rates=error");
  }
  revalidateTag(standCatalogTag(slug), "max");
  revalidatePath("/dashboard/shipping");
  redirect("/dashboard/shipping?rates=saved");
}
