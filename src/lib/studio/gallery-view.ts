/** Images for the Image section's gallery and slider modes. */
export const GALLERY_MAX_IMAGES = 12;

export const IMAGE_DISPLAYS = ["single", "gallery", "slider"] as const;
export type ImageDisplay = (typeof IMAGE_DISPLAYS)[number];

export const IMAGE_ASPECTS = ["square", "landscape", "portrait"] as const;
export type ImageAspect = (typeof IMAGE_ASPECTS)[number];

export type GalleryImage = { url: string; alt?: string };

export const ASPECT_CLASS: Record<ImageAspect, string> = {
  square: "aspect-square",
  landscape: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
};

export function parseImageDisplay(raw: unknown): ImageDisplay {
  return (IMAGE_DISPLAYS as readonly unknown[]).includes(raw) ? (raw as ImageDisplay) : "single";
}

export function parseImageAspect(raw: unknown): ImageAspect {
  return (IMAGE_ASPECTS as readonly unknown[]).includes(raw) ? (raw as ImageAspect) : "landscape";
}
