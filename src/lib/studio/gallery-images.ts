import { z } from "zod";
import { mediaUrl, shortText } from "@/lib/website/sections/fields";

/** Images for the Image section's gallery and slider modes. */
export const GALLERY_MAX_IMAGES = 12;

export const IMAGE_DISPLAYS = ["single", "gallery", "slider"] as const;
export type ImageDisplay = (typeof IMAGE_DISPLAYS)[number];

export const IMAGE_ASPECTS = ["square", "landscape", "portrait"] as const;
export type ImageAspect = (typeof IMAGE_ASPECTS)[number];

export const galleryImageSchema = z.object({ url: mediaUrl.min(1), alt: shortText.optional() });
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export const galleryImagesSchema = z.array(galleryImageSchema).max(GALLERY_MAX_IMAGES);

export const ASPECT_CLASS: Record<ImageAspect, string> = {
  square: "aspect-square",
  landscape: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
};

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

export function parseImageDisplay(raw: unknown): ImageDisplay {
  return (IMAGE_DISPLAYS as readonly unknown[]).includes(raw) ? (raw as ImageDisplay) : "single";
}

export function parseImageAspect(raw: unknown): ImageAspect {
  return (IMAGE_ASPECTS as readonly unknown[]).includes(raw) ? (raw as ImageAspect) : "landscape";
}
