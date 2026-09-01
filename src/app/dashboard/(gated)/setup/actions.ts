"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensurePrimaryStand } from "@/lib/ensure-primary-stand";
import {
  FULFILMENT_INTENTS,
  SELL_CATEGORIES,
} from "@/lib/business-mode";

export async function saveSetupSellCategories(formData: FormData) {
  const { owner } = await requireOwner();
  const selected = formData.getAll("sellCategories").map(String);
  const allowed = new Set<string>(SELL_CATEGORIES.map((c) => c.id));
  const sellCategories = selected.filter((id) => allowed.has(id));

  await prisma.owner.update({
    where: { id: owner.id },
    data: { sellCategories },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/getting-started");
  redirect("/dashboard/getting-started");
}

export async function saveSetupFulfilment(formData: FormData) {
  const { owner } = await requireOwner();
  const selected = formData.getAll("fulfilmentIntents").map(String);
  const allowed = new Set<string>(FULFILMENT_INTENTS.map((f) => f.id));
  const fulfilmentIntents = selected.filter((id) => allowed.has(id));

  await prisma.owner.update({
    where: { id: owner.id },
    data: { fulfilmentIntents },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/getting-started");
  redirect("/dashboard/getting-started");
}

export async function saveSetupBranding(formData: FormData) {
  const { owner } = await requireOwner();
  const brandAccentColor =
    String(formData.get("brandAccentColor") ?? "").trim() || null;
  const brandSecondaryColor =
    String(formData.get("brandSecondaryColor") ?? "").trim() || null;

  await prisma.owner.update({
    where: { id: owner.id },
    data: { brandAccentColor, brandSecondaryColor },
  });

  const stand = await ensurePrimaryStand({
    ...owner,
    brandAccentColor,
    brandSecondaryColor,
  });

  await prisma.stand.update({
    where: { id: stand.id },
    data: {
      accentColor: brandAccentColor,
      secondaryColor: brandSecondaryColor,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/getting-started");
  redirect("/dashboard/getting-started");
}
