"use server";

import { revalidatePath } from "next/cache";
import { GallerySource, GalleryStatus } from "@/generated/prisma/client";
import { uploadGalleryImage } from "@/lib/gallery-upload";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function setGalleryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as GalleryStatus;
  if (!id || !Object.values(GalleryStatus).includes(status)) return;

  await prisma.galleryStand.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deleteGalleryStand(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.galleryStand.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function addGalleryStand(formData: FormData) {
  await requireAdmin();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const imagePath = String(formData.get("imagePath") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 100);
  const file = formData.get("photo");

  if (displayName.length < 2 || location.length < 2) {
    throw new Error("Name and location are required.");
  }

  let imageUrl = imagePath;
  if (file instanceof File && file.size > 0) {
    imageUrl = await uploadGalleryImage(file);
  }
  if (!imageUrl) {
    throw new Error("Provide a photo upload or a public image path.");
  }

  await prisma.galleryStand.create({
    data: {
      displayName,
      location,
      caption: caption || null,
      imageUrl,
      source: GallerySource.ADMIN,
      status: GalleryStatus.APPROVED,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 100,
    },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
