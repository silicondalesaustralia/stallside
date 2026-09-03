"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";

export async function saveLoyaltyProgram(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim() || "Rewards";
  const pointsPerCurrency = Math.max(
    1,
    Number.parseInt(String(formData.get("pointsPerCurrency") ?? "1"), 10) || 1,
  );
  const rewardThreshold = Math.max(
    1,
    Number.parseInt(String(formData.get("rewardThreshold") ?? "100"), 10) || 100,
  );
  const rewardDollars = String(formData.get("rewardAmount") ?? "10").trim();
  const rewardCents = dollarsToCents(rewardDollars || "10");
  const isActive = formData.get("isActive") === "on";

  await prisma.loyaltyProgram.upsert({
    where: { ownerId: owner.id },
    create: {
      ownerId: owner.id,
      name,
      isActive,
      pointsPerCurrency,
      rewardThreshold,
      rewardCents,
    },
    update: {
      name,
      isActive,
      pointsPerCurrency,
      rewardThreshold,
      rewardCents,
    },
  });

  revalidatePath("/dashboard/loyalty");
  redirect("/dashboard/loyalty?saved=1");
}
