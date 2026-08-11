"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function dismissPreOrdersCrossSell() {
  const { owner } = await requireOwner();
  await prisma.owner.update({
    where: { id: owner.id },
    data: { preOrdersCrossSellDismissedAt: new Date() },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
