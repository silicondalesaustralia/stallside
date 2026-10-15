import { z } from "zod";
import { mediaUrl, shortText } from "@/lib/website/sections/fields";
import { GALLERY_MAX_IMAGES, type GalleryImage } from "./gallery-view";

export * from "./gallery-view";

export const galleryImageSchema = z.object({ url: mediaUrl.min(1), alt: shortText.optional() }) satisfies z.ZodType<GalleryImage>;
export const galleryImagesSchema = z.array(galleryImageSchema).max(GALLERY_MAX_IMAGES);

/** Saved images, skipping anything malformed (old or hand-edited data). */
export function parseGalleryImages(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((item) => {
      const parsed = galleryImageSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    })
    .slice(0, GALLERY_MAX_IMAGES);
}
