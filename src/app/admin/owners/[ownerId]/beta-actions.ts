"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SOCIAL_BETA } from "@/lib/beta-features";

/** Add or remove the owner from the Social kit beta. */
export async function setSocialBeta(ownerId: string, enabled: boolean) {
  await requireAdmin();
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { betaFeatures: true },
  });
  if (!owner) throw new Error("Owner not found");

  const rest = owner.betaFeatures.filter((f) => f !== SOCIAL_BETA);
  await prisma.owner.update({
    where: { id: ownerId },
    data: { betaFeatures: enabled ? [...rest, SOCIAL_BETA] : rest },
  });
  revalidatePath(`/admin/owners/${ownerId}`);
}
