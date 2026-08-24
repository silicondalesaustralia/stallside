"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function dismissPreOrdersCrossSell() {
  const { owner } = await requireOwnerWrite();
  await prisma.owner.update({
    where: { id: owner.id },
    data: { preOrdersCrossSellDismissedAt: new Date() },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
