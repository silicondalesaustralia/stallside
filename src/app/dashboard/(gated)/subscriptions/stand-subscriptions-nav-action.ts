"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function updateStandSubscriptionsNav(
  standId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true, slug: true },
  });
  if (!stand) return { error: "Business not found." };

  const showSubscriptionsOnStand =
    formData.get("showSubscriptionsOnStand") === "on";

  await prisma.stand.update({
    where: { id: stand.id },
    data: { showSubscriptionsOnStand },
  });

  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/businesses/${stand.id}`);
  revalidatePath(`/s/${stand.slug}`);
  return { ok: true as const };
}
