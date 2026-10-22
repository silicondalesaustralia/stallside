"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BETA_APP_ACCESS } from "@/lib/beta-features";

/** Grant or revoke access to the beta app (beta.vendl.app). */
export async function setBetaAppAccess(ownerId: string, enabled: boolean) {
  await requireAdmin();
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { betaFeatures: true },
  });
  if (!owner) throw new Error("Owner not found");

  const rest = owner.betaFeatures.filter((f) => f !== BETA_APP_ACCESS);
  await prisma.owner.update({
    where: { id: ownerId },
    data: { betaFeatures: enabled ? [...rest, BETA_APP_ACCESS] : rest },
  });
  revalidatePath(`/admin/owners/${ownerId}`);
}
