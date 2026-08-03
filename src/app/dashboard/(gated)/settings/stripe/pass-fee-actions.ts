"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { shouldChargeStallsideFee } from "@/lib/stallside-fee";

export async function updatePassFeeToCustomer(passFeeToCustomer: boolean) {
  const { owner } = await requireOwner();
  if (!shouldChargeStallsideFee(owner)) {
    return { error: "No Stallside card fee on this plan." };
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: { passFeeToCustomer: Boolean(passFeeToCustomer) },
  });

  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
