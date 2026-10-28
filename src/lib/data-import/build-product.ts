import type { ImportIssue, ImportProduct, ImportVariant } from "./import-product";
import { htmlToText, parseFlag, parseMoney, parseStock } from "./parse-values";
import type { ImportRecord } from "./types";

const clip = (v: string | undefined, max: number) => (v ?? "").trim().slice(0, max);
const orNull = (v: string | undefined, max: number) => clip(v, max) || null;

function optionNames(base: ImportRecord, variants: ImportRecord[]): string[] {
  const names: string[] = [];
  for (const n of [1, 2, 3]) {
    const source = [base, ...variants].find((r) => r[`option${n}Name`]?.trim());
    const name = clip(source?.[`option${n}Name`], 40);
    if (!name) break;
    names.push(name);
  }
  return names;
}

function variantPrice(v: ImportRecord, base: ImportRecord): number | undefined {
  const price = parseMoney(v.price) ?? parseMoney(base.price);
  if (price === undefined) return undefined;
  return price + (parseMoney(v.surcharge) ?? 0);
}

/** One product (with any variants) from its base row and variant rows. */
export function buildProduct(
  key: string,
  baseRow: ImportRecord | null,
  variantRows: ImportRecord[],
): { product: ImportProduct; warnings: ImportIssue[] } | { ref: string; error: string } {
  const base = baseRow ?? variantRows[0];
  const name = clip(base?.name, 120);
  if (!base || !name) return { ref: key, error: "No product name." };

  const names = variantRows.length ? optionNames(base, variantRows) : [];
  const warnings: ImportIssue[] = [];
  const variants: ImportVariant[] = [];
  const seen = new Set<string>();
  // Without option names, variant rows (e.g. Wix's single default variant) just carry the SKU and stock.
  for (const v of names.length ? variantRows : []) {
    const values = names.map((_, i) => clip(v[`option${i + 1}Value`], 60));
    const priceCents = variantPrice(v, base);
    if (values.some((x) => !x) || priceCents === undefined) {
      warnings.push({ ref: name, message: "Skipped a variant with a missing option value or price." });
      continue;
    }
    const k = values.join("|").toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    variants.push({
      values,
      priceCents,
      compareAtCents: parseMoney(v.compareAtPrice) ?? null,
      costCents: parseMoney(v.cost) ?? null,
      sku: orNull(v.sku, 64),
      upc: orNull(v.barcode, 64),
      stock: parseStock(v.stock) ?? null,
    });
  }
  if (variants.length > 100) return { ref: name, error: "More than 100 variants." };

  const simple = variantRows[0] && variants.length === 0 ? variantRows[0] : base;
  const priceCents = variants.length
    ? Math.min(...variants.map((v) => v.priceCents))
    : parseMoney(simple.price) ?? parseMoney(base.price);
  if (priceCents === undefined) return { ref: name, error: "No price." };

  const taxable = parseFlag(base.taxable);
  return {
    warnings,
    product: {
      ref: name,
      name,
      description: clip(htmlToText(base.description), 2000),
      category: clip(base.category, 80),
      imageUrl: clip(base.imageUrl, 2048),
      hidden: parseFlag(base.active) === false,
      gstFree: taxable === undefined ? null : !taxable,
      priceCents,
      compareAtCents: variants.length
        ? null
        : (parseMoney(simple.compareAtPrice) ?? parseMoney(base.compareAtPrice) ?? null),
      costCents: variants.length ? null : (parseMoney(simple.cost) ?? parseMoney(base.cost) ?? null),
      sku: variants.length ? null : orNull(simple.sku || base.sku, 64),
      upc: variants.length ? null : orNull(simple.barcode || base.barcode, 64),
      stock: variants.length ? null : (parseStock(simple.stock) ?? parseStock(base.stock) ?? null),
      optionNames: variants.length ? names : [],
      variants,
    },
  };
}
