"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { assignLibraryAssetToProduct, matchLibraryAssetsToProducts } from "@/lib/media-library/assign";
import { deleteMediaLibraryAsset } from "@/lib/media-library/delete-asset";
import { uploadMediaLibraryAsset } from "@/lib/media-library/upload";

type Result = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/dashboard/data");
}

/** Uploads one photo into the owner's media library (client should shrink first). */
export async function uploadLibraryPhoto(formData: FormData): Promise<Result> {
  const { owner } = await requireOwnerWrite();
  try {
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
    const result = await uploadMediaLibraryAsset(owner.id, file);
    if (!result.ok) return { ok: false, error: result.error };
    refresh();
    return { ok: true };
  } catch (err) {
    console.error("[media library upload]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that photo." };
  }
}

/** Links a library photo onto a product. */
export async function linkLibraryPhotoToProduct(assetId: string, productId: string): Promise<Result> {
  const { owner } = await requireOwnerWrite();
  try {
    const result = await assignLibraryAssetToProduct(owner.id, assetId, productId);
    if (!result.ok) return { ok: false, error: result.error };
    refresh();
    revalidatePath(`/dashboard/products/${result.productId}`);
    return { ok: true };
  } catch (err) {
    console.error("[media library link]", err);
    return { ok: false, error: "Couldn't link that photo. Try again." };
  }
}

/** Matches library filenames to product slug, SKU or name and links matches. */
export async function matchLibraryPhotosToProducts(): Promise<
  Result & { matched?: number; skipped?: number }
> {
  const { owner } = await requireOwnerWrite();
  try {
    const { matched, skipped, errors } = await matchLibraryAssetsToProducts(owner.id);
    refresh();
    if (errors.length) {
      return { ok: false, error: errors.slice(0, 3).join(" "), matched, skipped };
    }
    return { ok: true, matched, skipped };
  } catch (err) {
    console.error("[media library match]", err);
    return { ok: false, error: "Couldn't match photos. Try again." };
  }
}

/** Removes a photo from the library (not from products that already use it). */
export async function removeLibraryPhoto(assetId: string): Promise<Result> {
  const { owner } = await requireOwnerWrite();
  try {
    const result = await deleteMediaLibraryAsset(owner.id, assetId);
    if (!result.ok) return { ok: false, error: result.error };
    refresh();
    return { ok: true };
  } catch (err) {
    console.error("[media library delete]", err);
    return { ok: false, error: "Couldn't remove that photo. Try again." };
  }
}
