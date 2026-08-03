"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";

export async function updatePassFeeToCustomer(passFeeToCustomer: boolean) {
  const { owner, user } = await requireOwner();
  if (
    ownerHasProAccess(owner, {
      email: user.email,
      role: user.role,
      lifetimeAccess: owner.lifetimeAccess,
    })
  ) {
    return { error: "Pro plans have no Stallside card fee." };
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: { passFeeToCustomer: Boolean(passFeeToCustomer) },
  });

  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
