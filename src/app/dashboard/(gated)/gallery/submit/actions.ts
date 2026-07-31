"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { GallerySource, GalleryStatus } from "@/generated/prisma/client";
import { uploadGalleryImage } from "@/lib/gallery-upload";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

export type GallerySubmitState = { error?: string; ok?: boolean };

export async function submitGalleryStand(
  _prev: GallerySubmitState,
  formData: FormData,
): Promise<GallerySubmitState> {
  const { owner } = await requireOwner();

  const displayName = String(formData.get("displayName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const standIdRaw = String(formData.get("standId") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const file = formData.get("photo");

  if (displayName.length < 2 || displayName.length > 120) {
    return { error: "Enter a stand name (2-120 characters)." };
  }
  if (location.length < 2 || location.length > 120) {
    return { error: "Enter a location (town or region is enough)." };
  }
  if (!consent) {
    return { error: "Please confirm you own the photo and allow us to show it." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo of your stand." };
  }

  let standId: string | null = null;
  if (standIdRaw) {
    const stand = await prisma.stand.findFirst({
      where: { id: standIdRaw, ownerId: owner.id },
      select: { id: true },
    });
    if (!stand) return { error: "That stand was not found." };
    standId = stand.id;
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadGalleryImage(file);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the photo.";
    return { error: message };
  }

  await prisma.galleryStand.create({
    data: {
      displayName,
      location,
      caption: caption || null,
      imageUrl,
      source: GallerySource.OWNER_SUBMIT,
      status: GalleryStatus.PENDING,
      ownerId: owner.id,
      standId,
      consentAt: new Date(),
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/dashboard/gallery/submit?submitted=1");
}
