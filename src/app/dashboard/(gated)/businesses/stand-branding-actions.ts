"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { brandingDataFromForm } from "./stand-branding-from-form";

export async function updateStandBranding(standId: string, formData: FormData) {
  try {
    const { owner } = await requireOwner();

    const stand = await prisma.stand.findFirst({
      where: { id: standId, ownerId: owner.id },
    });
    if (!stand) return { error: "Stand not found." };

    const parsed = await brandingDataFromForm(stand, formData);
    if (!parsed.ok) return { error: parsed.error };

    await prisma.stand.update({
      where: { id: stand.id },
      data: parsed.data,
    });

    revalidatePath(`/dashboard/businesses/${stand.id}`);
    revalidatePath(`/dashboard/businesses/${stand.id}/qr`);
    revalidatePath(`/s/${stand.slug}`);
    revalidateTag(standCatalogTag(stand.slug), "max");
    return { ok: true as const };
  } catch (error) {
    console.error("updateStandBranding failed", error);
    const message =
      error instanceof Error ? error.message : "Could not save branding.";
    return { error: message };
  }
}
