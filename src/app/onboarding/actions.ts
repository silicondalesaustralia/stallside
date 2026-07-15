"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOwnerWithTrial } from "@/lib/owner-trial";

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

  const existing = await prisma.owner.findUnique({ where: { userId: user.id } });
  if (existing) {
    await prisma.owner.update({
      where: { id: existing.id },
      data: { businessName, contactEmail, contactPhone },
    });
  } else {
    await createOwnerWithTrial({
      userId: user.id,
      name: businessName,
      email: contactEmail,
    });
    if (contactPhone) {
      await prisma.owner.update({
        where: { userId: user.id },
        data: { contactPhone },
      });
    }
  }

  redirect("/dashboard");
}
