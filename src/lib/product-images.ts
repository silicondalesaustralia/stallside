/** Main photo plus extras; the main photo is `Product.imageUrl`. */
export const PRODUCT_PHOTOS_MAX = 8;
export const PRODUCT_GALLERY_MAX = PRODUCT_PHOTOS_MAX - 1;

/** All photos for a product in display order, main photo first, without blanks or repeats. */
export function productImageList(imageUrl: string | null | undefined, gallery: readonly string[] | null | undefined): string[] {
  const all = [imageUrl, ...(gallery ?? [])].filter((url): url is string => Boolean(url && url.trim()));
  return all.filter((url, i) => all.indexOf(url) === i).slice(0, PRODUCT_PHOTOS_MAX);
}

/** Moves one extra photo up or down; out-of-range moves leave the list as it was. */
export function moveGalleryImage(gallery: readonly string[], url: string, direction: -1 | 1): string[] {
  const from = gallery.indexOf(url);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= gallery.length) return [...gallery];
  const next = [...gallery];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
