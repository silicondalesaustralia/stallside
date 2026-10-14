"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { parseFulfilmentChoice } from "@/lib/fulfilment/handover-choice";

/** Site-wide pickup / delivery for a business's take-now products. */
export async function saveFulfilmentDefault(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const choice = parseFulfilmentChoice(formData.get("fulfilmentDefault"));
  if (!choice) redirect("/dashboard/shipping?fulfilment=invalid");
  let slug: string | null = null;
  try {
    const stand = await prisma.stand.findFirst({
      where: { id: standId, ownerId: owner.id },
      select: { slug: true },
    });
    if (!stand) redirect("/dashboard/shipping?fulfilment=invalid");
    await prisma.stand.update({ where: { id: standId }, data: { fulfilmentDefault: choice } });
    slug = stand.slug;
  } catch (error) {
    unstable_rethrow(error);
    console.error("saveFulfilmentDefault failed", error);
    redirect("/dashboard/shipping?fulfilment=error");
  }
  revalidateTag(standCatalogTag(slug), "max");
  revalidatePath("/dashboard/shipping");
  revalidatePath("/dashboard/products", "layout");
  redirect("/dashboard/shipping?fulfilment=saved");
}
