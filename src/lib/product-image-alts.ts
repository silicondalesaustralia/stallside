export const PRODUCT_IMAGE_ALT_MAX = 150;

export type ProductImageAlts = Record<string, string>;

/** Saved alt text by photo URL; anything malformed is ignored. */
export function parseImageAlts(value: unknown): ProductImageAlts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: ProductImageAlts = {};
  for (const [url, alt] of Object.entries(value)) {
    if (typeof alt === "string" && alt.trim()) out[url] = alt.trim().slice(0, PRODUCT_IMAGE_ALT_MAX);
  }
  return out;
}

/** Sets or clears one photo's alt text and drops entries for photos the product no longer has. */
export function withImageAlt(alts: ProductImageAlts, photos: readonly string[], url: string, alt: string): ProductImageAlts {
  const next: ProductImageAlts = {};
  for (const photo of photos) {
    const text = photo === url ? alt.trim().slice(0, PRODUCT_IMAGE_ALT_MAX) : alts[photo];
    if (text) next[photo] = text;
  }
  return next;
}

/** Alt text shown for photo `i`: the seller's own, else the product name. */
export function photoAlt(name: string, alts: readonly string[] | undefined, i: number): string {
  return alts?.[i] || (i === 0 ? name : `${name}, photo ${i + 1}`);
}

/** Alt text for each photo in order; blank where the seller hasn't written one. */
export function imageAltList(photos: readonly string[], alts: ProductImageAlts): string[] {
  return photos.map((url) => alts[url] ?? "");
}
