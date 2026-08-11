"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pathAfterBusinessSwitch } from "@/lib/dashboard-business-switch";
import { writeSelectedBusinessCookie } from "@/lib/selected-business";

export async function selectBusiness(standId: string, currentPath?: string) {
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

  const next = pathAfterBusinessSwitch(currentPath ?? "", stand.id);
  if (next && next !== currentPath) {
    redirect(next);
  }
  return { ok: true as const };
}
