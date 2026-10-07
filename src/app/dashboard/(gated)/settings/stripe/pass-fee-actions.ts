"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { feePassOnAllowed, shouldChargeVendlFee } from "@/lib/stallside-fee";

export async function updatePassFeeToCustomer(passFeeToCustomer: boolean) {
  const { owner } = await requireOwnerWrite();
  if (!shouldChargeVendlFee(owner)) {
    return { error: "No Vendl card fee on this plan." };
  }
  if (passFeeToCustomer && !feePassOnAllowed(owner)) {
    return { error: "Card surcharges aren't allowed in Australia." };
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: { passFeeToCustomer: Boolean(passFeeToCustomer) },
  });

  revalidatePath("/dashboard/settings/stripe");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
