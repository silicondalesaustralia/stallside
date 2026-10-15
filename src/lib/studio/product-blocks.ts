/** Parts of the product page a seller can move between zones. */
export const PRODUCT_BLOCKS = ["name", "rating", "price", "description", "buy", "infoRows", "tabs"] as const;
export type ProductBlockId = (typeof PRODUCT_BLOCKS)[number];

/** Under the photos, the details column beside them, and full width below both. */
export const PRODUCT_ZONES = ["photo", "details", "below"] as const;
export type ProductZone = (typeof PRODUCT_ZONES)[number];

export type ProductBlockLayout = Record<ProductZone, ProductBlockId[]>;

export const PRODUCT_BLOCK_LABELS: Record<ProductBlockId, string> = {
  name: "Name & pre-order label",
  rating: "Review stars & rating",
  price: "Price",
  description: "Description",
  buy: "Quantity & cart buttons",
  infoRows: "Info lines",
  tabs: "Info tabs",
};

export const PRODUCT_ZONE_LABELS: Record<ProductZone, string> = {
  photo: "Under the photos",
  details: "Details column",
  below: "Full width below",
};

export const DEFAULT_BLOCK_LAYOUT: ProductBlockLayout = {
  photo: [],
  details: [...PRODUCT_BLOCKS],
  below: [],
};

/**
 * Saved layout with every block exactly once; blocks it doesn't mention go to the end of the details
 * column, except the rating, which goes straight after the name (layouts saved before it existed).
 */
export function parseBlockLayout(raw: unknown): ProductBlockLayout {
  const out: ProductBlockLayout = { photo: [], details: [], below: [] };
  const seen = new Set<ProductBlockId>();
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  for (const zone of PRODUCT_ZONES) {
    const list = Array.isArray(obj[zone]) ? (obj[zone] as unknown[]) : [];
    for (const id of list) {
      if (!(PRODUCT_BLOCKS as readonly unknown[]).includes(id)) continue;
      const block = id as ProductBlockId;
      if (seen.has(block)) continue;
      seen.add(block);
      out[zone].push(block);
    }
  }
  for (const block of PRODUCT_BLOCKS) {
    if (seen.has(block)) continue;
    seen.add(block);
    const nameZone = block === "rating" ? PRODUCT_ZONES.find((zone) => out[zone].includes("name")) : undefined;
    if (nameZone) out[nameZone].splice(out[nameZone].indexOf("name") + 1, 0, block);
    else out.details.push(block);
  }
  return out;
}

/** Moves a block to `index` in `zone`, counted with the block itself already taken out. */
export function moveBlock(
  layout: ProductBlockLayout,
  block: ProductBlockId,
  zone: ProductZone,
  index: number,
): ProductBlockLayout {
  const next: ProductBlockLayout = {
    photo: layout.photo.filter((b) => b !== block),
    details: layout.details.filter((b) => b !== block),
    below: layout.below.filter((b) => b !== block),
  };
  const at = Math.max(0, Math.min(index, next[zone].length));
  next[zone] = [...next[zone].slice(0, at), block, ...next[zone].slice(at)];
  return next;
}

export function zoneOfBlock(layout: ProductBlockLayout, block: ProductBlockId): ProductZone {
  return PRODUCT_ZONES.find((zone) => layout[zone].includes(block)) ?? "details";
}
