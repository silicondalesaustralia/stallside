/** Normalise a filename or product name/slug for fuzzy photo matching. */
export function mediaMatchKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type MediaMatchProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
};

/** Best product for a library filename, if any (exact slug/sku/name key). */
export function matchProductForFileName(
  fileName: string,
  products: MediaMatchProduct[],
): MediaMatchProduct | null {
  const key = mediaMatchKey(fileName);
  if (!key) return null;
  return (
    products.find((p) => mediaMatchKey(p.slug) === key) ??
    products.find((p) => p.sku && mediaMatchKey(p.sku) === key) ??
    products.find((p) => mediaMatchKey(p.name) === key) ??
    null
  );
}
