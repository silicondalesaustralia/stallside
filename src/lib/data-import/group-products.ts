import type { ImportIssue, ImportProduct } from "./import-product";
import { buildProduct } from "./build-product";
import type { ImportRecord, PreparedRow } from "./types";

type Group = { key: string; base: ImportRecord | null; variants: ImportRecord[]; image: string };

/** Collects prepared rows into products; variant rows join their parent's group. */
export function groupProducts(rows: PreparedRow[]): {
  products: ImportProduct[];
  issues: ImportIssue[];
} {
  const groups = new Map<string, Group>();
  const aliasTo = new Map<string, string>();
  const issues: ImportIssue[] = [];

  rows.forEach((row, i) => {
    if (row.kind === "skip") return;
    const key = aliasTo.get(row.group) ?? row.group;
    if (!key) {
      issues.push({ ref: `Row ${i + 2}`, message: "No product name or handle." });
      return;
    }
    let group = groups.get(key);
    if (!group) {
      group = { key, base: null, variants: [], image: "" };
      groups.set(key, group);
    }
    for (const alias of row.aliases ?? []) aliasTo.set(alias, key);

    if (row.kind === "media") {
      group.image ||= (row.rec.imageUrl ?? "").trim();
    } else if (row.kind === "parent") {
      group.base ??= row.rec;
    } else if (row.kind === "product") {
      if (group.base) {
        issues.push({ ref: row.rec.name || key, message: "Listed more than once. Only the first row is used." });
        return;
      }
      group.base = row.rec;
    } else {
      if (!group.base && row.rec.name) group.base = row.rec;
      group.variants.push(row.rec);
    }
  });

  const products: ImportProduct[] = [];
  for (const group of groups.values()) {
    const base =
      group.base && !group.base.imageUrl?.trim() && group.image
        ? { ...group.base, imageUrl: group.image }
        : group.base;
    const built = buildProduct(group.key, base, group.variants);
    if ("error" in built) issues.push({ ref: built.ref, message: built.error });
    else {
      products.push(built.product);
      issues.push(...built.warnings);
    }
  }
  return { products, issues };
}
