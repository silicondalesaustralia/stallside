"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function approveReview(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.review.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Review not found");

  await prisma.review.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidatePath("/dashboard/reviews");
  redirect("/dashboard/reviews");
}

export async function rejectReview(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.review.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Review not found");

  await prisma.review.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/dashboard/reviews");
  redirect("/dashboard/reviews");
}
