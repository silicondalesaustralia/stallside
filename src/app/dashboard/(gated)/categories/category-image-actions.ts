"use server";

import { requireOwnerWrite } from "@/lib/session";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";

export type CategoryImageUploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Upload a category thumbnail; the URL is saved when the category form is saved. */
export async function uploadCategoryImage(formData: FormData): Promise<CategoryImageUploadResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload." };
    return { ok: true, url: await uploadStorefrontHero(owner.id, file) };
  } catch (err) {
    console.error("[category image upload]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that image." };
  }
}
