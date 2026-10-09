"use server";

import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";

export type SectionImageUploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Upload an image for one editor section; the URL is saved with the layout draft, not branding. */
export async function uploadSectionImage(formData: FormData): Promise<SectionImageUploadResult> {
  const { owner } = await requireWebsiteOwner();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  try {
    return { ok: true, url: await uploadStorefrontHero(owner.id, file) };
  } catch (err) {
    console.error("[section image upload]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't upload that image." };
  }
}
