"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeSelectedBusinessCookie } from "@/lib/selected-business";

export async function selectBusiness(standId: string) {
  const { owner } = await requireOwner();
  const id = standId.trim();
  if (!id) return { error: "Pick a business." as const };

  const stand = await prisma.stand.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!stand) return { error: "Business not found." as const };

  await writeSelectedBusinessCookie(stand.id);
  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}
