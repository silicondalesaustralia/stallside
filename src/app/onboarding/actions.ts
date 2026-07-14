"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;

  if (businessName.length < 2 || !contactEmail.includes("@")) {
    redirect("/onboarding");
  }

  await prisma.owner.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      businessName,
      contactEmail,
      contactPhone,
    },
    update: {
      businessName,
      contactEmail,
      contactPhone,
    },
  });

  redirect("/dashboard");
}
