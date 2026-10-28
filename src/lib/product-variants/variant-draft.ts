import { MAX_VARIANTS_PER_PRODUCT } from "./variant-title";

export type DraftOption = { name: string; values: string };

export type DraftVariant = {
  values: string[];
  price: string;
  sku: string;
  stock: string;
};

export function splitValues(raw: string): string[] {
  return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))];
}

/** Every combination of the option values, keeping prices/SKUs/stock of rows that already exist. */
export function buildCombinations(
  options: DraftOption[],
  existing: DraftVariant[],
  defaultPrice: string,
): DraftVariant[] {
  const lists = options.map((o) => splitValues(o.values)).filter((l) => l.length > 0);
  if (lists.length === 0) return [];
  let combos: string[][] = [[]];
  for (const list of lists) {
    combos = combos.flatMap((c) => list.map((v) => [...c, v]));
    if (combos.length > MAX_VARIANTS_PER_PRODUCT) break;
  }
  const byKey = new Map(existing.map((v) => [v.values.join("|").toLowerCase(), v]));
  return combos.slice(0, MAX_VARIANTS_PER_PRODUCT).map((values) => {
    const prior = byKey.get(values.join("|").toLowerCase());
    return prior
      ? { ...prior, values }
      : { values, price: defaultPrice, sku: "", stock: "0" };
  });
}

function toCents(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Payload for saveProductVariants. */
export function draftToPayload(options: DraftOption[], variants: DraftVariant[]) {
  return {
    optionNames: options.map((o) => o.name.trim()).filter(Boolean),
    variants: variants.map((v) => ({
      values: v.values,
      sku: v.sku.trim() || null,
      priceCents: toCents(v.price),
      stockQuantity: Math.max(0, Number.parseInt(v.stock || "0", 10) || 0),
    })),
  };
}
