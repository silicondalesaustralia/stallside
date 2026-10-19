"use server";

import { requireOwnerWrite } from "@/lib/session";
import {
  addOwnerProductPhoto,
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
