"use server";

import { requireOwner, requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  addOwnerProductPhoto,
  addOwnerProductPhotoFromUrl,
  removeOwnerProductPhoto,
  reorderOwnerProductPhotos,
  saveOwnerProductPhotoAlt,
  type PhotoResult as ServiceResult,
} from "@/lib/products/photos";

type PhotoResult = { ok: true } | { ok: false; error: string };

const toActionResult = (result: ServiceResult): PhotoResult =>
  "error" in result ? { ok: false, error: result.error } : result;

/** Uploads one photo and adds it after the others; the first photo a product gets becomes its main photo. */
export async function addProductPhoto(productId: string, formData: FormData): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
    return toActionResult(await addOwnerProductPhoto(owner.id, productId, file));
  } catch (err) {
    console.error("[product photo add]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that photo." };
  }
}

/** Adds a photo from the owner's media library (by library asset id). */
export async function addProductPhotoFromLibrary(productId: string, assetId: string): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    const asset = await prisma.mediaLibraryAsset.findFirst({
      where: { id: assetId, ownerId: owner.id },
      select: { url: true },
    });
    if (!asset) return { ok: false, error: "Photo not found in your library." };
    return toActionResult(await addOwnerProductPhotoFromUrl(owner.id, productId, asset.url));
  } catch (err) {
    console.error("[product photo from library]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't add that photo." };
  }
}

/** Lists media library photos for the product editor picker. */
export async function listProductMediaLibrary(): Promise<
  { ok: true; assets: { id: string; url: string; fileName: string }[] } | { ok: false; error: string }
> {
  const { owner } = await requireOwner();
  try {
    const assets = await prisma.mediaLibraryAsset.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, url: true, fileName: true },
    });
    return { ok: true, assets };
  } catch (err) {
    console.error("[product media library list]", err);
    return { ok: false, error: "Couldn't load the photo library." };
  }
}

/** Removes a photo; removing the main photo makes the next one the main photo. */
export async function removeProductPhoto(productId: string, url: string): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    return toActionResult(await removeOwnerProductPhoto(owner.id, productId, url));
  } catch (err) {
    console.error("[product photo remove]", err);
    return { ok: false, error: "Couldn't remove that photo. Try again." };
  }
}

/** Saves a new photo order; the first photo becomes the main photo. */
export async function reorderProductPhotos(productId: string, order: string[]): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    return toActionResult(await reorderOwnerProductPhotos(owner.id, productId, order));
  } catch (err) {
    console.error("[product photo reorder]", err);
    return { ok: false, error: "Couldn't reorder photos. Try again." };
  }
}

/** Saves one photo's alt text (what screen readers and search engines read); blank clears it. */
export async function saveProductPhotoAlt(productId: string, url: string, alt: string): Promise<PhotoResult> {
  const { owner } = await requireOwnerWrite();
  try {
    return toActionResult(await saveOwnerProductPhotoAlt(owner.id, productId, url, alt));
  } catch (err) {
    console.error("[product photo alt]", err);
    return { ok: false, error: "Couldn't save the alt text. Try again." };
  }
}
