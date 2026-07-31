"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { brandingDataFromForm } from "./stand-branding-from-form";

export async function updateStandBranding(standId: string, formData: FormData) {
  try {
    const { owner, user } = await requireOwner();
    if (
      !ownerHasProAccess(owner, { email: user.email, role: user.role })
    ) {
      return { error: "Branding requires Stallside Pro." };
    }

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

    revalidatePath(`/dashboard/stands/${stand.id}`);
    revalidatePath(`/dashboard/stands/${stand.id}/qr`);
    revalidatePath(`/s/${stand.slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("updateStandBranding failed", error);
    const message =
      error instanceof Error ? error.message : "Could not save branding.";
    return { error: message };
  }
}
