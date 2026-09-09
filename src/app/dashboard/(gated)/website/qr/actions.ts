"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { StandQrLinkMode } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  standId: z.string().min(1),
  linkMode: z.enum(["WEBSITE_HOME", "WEBSITE_CATEGORY"]),
  categoryId: z.string().optional(),
});

export async function createQrCode(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    standId: formData.get("standId"),
    linkMode: formData.get("linkMode") || "WEBSITE_CATEGORY",
    categoryId: formData.get("categoryId") || undefined,
  });
  if (!parsed.success) {
    return { error: "Check the QR details." };
  }

  const stand = await prisma.stand.findFirst({
    where: { id: parsed.data.standId, ownerId: owner.id },
    select: { id: true },
  });
  if (!stand) return { error: "Business not found." };

  let categoryId: string | null = null;
  let linkMode: StandQrLinkMode = StandQrLinkMode.WEBSITE_HOME;

  if (parsed.data.linkMode === "WEBSITE_CATEGORY") {
    const categoryIdRaw = parsed.data.categoryId?.trim();
    if (!categoryIdRaw) {
      return { error: "Pick a category for this QR." };
    }
    const category = await prisma.category.findFirst({
      where: { id: categoryIdRaw, ownerId: owner.id, isActive: true },
      select: { id: true },
    });
    if (!category) return { error: "Category not found." };
    categoryId = category.id;
    linkMode = StandQrLinkMode.WEBSITE_CATEGORY;
  }

  const qr = await prisma.qrCode.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name: parsed.data.name,
      linkMode,
      categoryId,
    },
  });

  revalidatePath("/dashboard/website/qr");
  redirect(`/dashboard/website/qr/${qr.id}`);
}

export async function updateQrCode(qrId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId: owner.id },
    select: { id: true },
  });
  if (!qr) return { error: "QR not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 80) {
    return { error: "Name is required." };
  }

  await prisma.qrCode.update({
    where: { id: qr.id },
    data: { name },
  });
  revalidatePath(`/dashboard/website/qr/${qr.id}`);
  revalidatePath("/dashboard/website/qr");
  return { ok: true as const };
}

export async function deleteQrCode(qrId: string) {
  const { owner } = await requireOwnerWrite();
  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId: owner.id },
    select: { id: true },
  });
  if (!qr) return { error: "QR not found." };

  await prisma.qrCode.delete({ where: { id: qr.id } });
  revalidatePath("/dashboard/website/qr");
  redirect("/dashboard/website/qr");
}
