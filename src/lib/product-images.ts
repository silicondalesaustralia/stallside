/** Main photo plus extras; the main photo is `Product.imageUrl`. */
export const PRODUCT_PHOTOS_MAX = 8;
export const PRODUCT_GALLERY_MAX = PRODUCT_PHOTOS_MAX - 1;

/** All photos for a product in display order, main photo first, without blanks or repeats. */
export function productImageList(imageUrl: string | null | undefined, gallery: readonly string[] | null | undefined): string[] {
  const all = [imageUrl, ...(gallery ?? [])].filter((url): url is string => Boolean(url && url.trim()));
  return all.filter((url, i) => all.indexOf(url) === i).slice(0, PRODUCT_PHOTOS_MAX);
}

/** Back to the stored shape: the first photo is the main photo, the rest are extras. */
export function splitProductPhotos(photos: readonly string[]): { imageUrl: string | null; galleryImageUrls: string[] } {
  const [first, ...rest] = photos;
  return { imageUrl: first ?? null, galleryImageUrls: rest };
}

/** True when `next` is a reordering of `current` (same photos, nothing added or lost). */
export function isPhotoReorder(current: readonly string[], next: readonly string[]): boolean {
  if (current.length !== next.length || new Set(next).size !== next.length) return false;
  return next.every((url) => current.includes(url));
}

/** Moves one photo up or down; out-of-range moves leave the list as it was. */
export function moveGalleryImage(gallery: readonly string[], url: string, direction: -1 | 1): string[] {
  const from = gallery.indexOf(url);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= gallery.length) return [...gallery];
  const next = [...gallery];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
