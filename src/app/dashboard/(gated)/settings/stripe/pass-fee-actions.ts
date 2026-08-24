"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { shouldChargeVendlFee } from "@/lib/stallside-fee";

export async function updatePassFeeToCustomer(passFeeToCustomer: boolean) {
  const { owner } = await requireOwnerWrite();
  if (!shouldChargeVendlFee(owner)) {
    return { error: "No Vendl card fee on this plan." };
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: { passFeeToCustomer: Boolean(passFeeToCustomer) },
  });

  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
