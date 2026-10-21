import { isColourValue } from "./colour-value";
import { colourHex, type ThemePalette } from "./colour";

/** How photos sit in their frames; site-wide defaults, overridable per section. */
export const PHOTO_FITS = ["cover", "contain"] as const;
export const PHOTO_FOCI = ["top", "center", "bottom"] as const;
export const PHOTO_SHAPES = ["original", "square", "portrait", "landscape", "wide"] as const;
export type PhotoFit = (typeof PHOTO_FITS)[number];
export type PhotoFocus = (typeof PHOTO_FOCI)[number];
export type PhotoShape = (typeof PHOTO_SHAPES)[number];

export const PHOTO_FIT_LABELS: Record<PhotoFit, string> = { cover: "Fill frame (crop)", contain: "Show whole photo" };
export const PHOTO_FOCUS_LABELS: Record<PhotoFocus, string> = { top: "Top", center: "Centre", bottom: "Bottom" };
export const PHOTO_SHAPE_LABELS: Record<PhotoShape, string> = {
  original: "Original shape",
  square: "Square",
  portrait: "Tall (4:5)",
  landscape: "Wide (4:3)",
  wide: "Extra wide (16:9)",
};

const FOCUS: Record<PhotoFocus, string> = { top: "50% 0%", center: "50% 50%", bottom: "50% 100%" };
const RATIO: Record<Exclude<PhotoShape, "original">, string> = {
  square: "1 / 1",
  portrait: "4 / 5",
  landscape: "4 / 3",
  wide: "16 / 9",
};

export type PhotoStyle = {
  photoFit?: PhotoFit;
  photoFocus?: PhotoFocus;
  photoShape?: PhotoShape;
  /** Fills the space around a whole (uncropped) photo. */
  photoBackground?: string;
};

/** CSS variables read by `.sf-photo` (fit, focus) and `.sf-photo-frame` (shape) in website-builder.css. */
export function photoVars(style: PhotoStyle): Record<string, string> {
  const vars: Record<string, string> = {};
  if (style.photoFit) vars["--photo-fit"] = style.photoFit;
  if (style.photoFocus) vars["--photo-focus"] = FOCUS[style.photoFocus];
  if (style.photoShape === "original") {
    vars["--photo-ratio"] = "auto";
  } else if (style.photoShape) {
    vars["--photo-ratio"] = RATIO[style.photoShape];
    vars["--photo-box-ratio"] = RATIO[style.photoShape];
  }
  return vars;
}

/** Colour behind photos; `.sf-photo` reads it. */
export function photoBackgroundVars(style: PhotoStyle, palette: ThemePalette): Record<string, string> {
  return style.photoBackground ? { "--photo-bg": colourHex(style.photoBackground, palette) } : {};
}

/** Drops anything that isn't a known photo option. */
export function parsePhotoStyle(obj: Record<string, unknown>): PhotoStyle {
  const out: PhotoStyle = {};
  if ((PHOTO_FITS as readonly unknown[]).includes(obj.photoFit)) out.photoFit = obj.photoFit as PhotoFit;
  if ((PHOTO_FOCI as readonly unknown[]).includes(obj.photoFocus)) out.photoFocus = obj.photoFocus as PhotoFocus;
  if ((PHOTO_SHAPES as readonly unknown[]).includes(obj.photoShape)) out.photoShape = obj.photoShape as PhotoShape;
  if (isColourValue(obj.photoBackground)) out.photoBackground = obj.photoBackground;
  return out;
}
