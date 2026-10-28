import type { ImportEntity } from "./fields";
import { groupProducts } from "./group-products";
import type { ImportCustomer, ImportIssue, ImportProduct, ImportStock } from "./import-product";
import { parseFlag, parseStock } from "./parse-values";
import { prepareGeneric } from "./presets/generic";
import type { ImportPreset, ImportRecord } from "./types";

export type BuiltImport =
  | { entity: "products"; items: ImportProduct[]; issues: ImportIssue[] }
  | { entity: "customers"; items: ImportCustomer[]; issues: ImportIssue[] }
  | { entity: "inventory"; items: ImportStock[]; issues: ImportIssue[] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildCustomers(records: ImportRecord[]): BuiltImport {
  const items: ImportCustomer[] = [];
  const issues: ImportIssue[] = [];
  const seen = new Set<string>();
  records.forEach((r, i) => {
    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL.test(email)) {
      if (email || r.name || r.firstName) issues.push({ ref: `Row ${i + 2}`, message: "No valid email." });
      return;
    }
    if (seen.has(email)) return;
    seen.add(email);
    const name = [r.firstName, r.lastName].map((s) => s?.trim()).filter(Boolean).join(" ") || r.name?.trim();
    items.push({
      email,
      name: name ? name.slice(0, 120) : null,
      phone: r.phone?.trim().slice(0, 40) || null,
      notes: r.notes?.trim().slice(0, 1000) || null,
      marketingConsent: parseFlag(r.marketingConsent) === true,
    });
  });
  return { entity: "customers", items, issues };
}

function buildStock(records: ImportRecord[], sumRepeated: boolean): BuiltImport {
  const items: ImportStock[] = [];
  const issues: ImportIssue[] = [];
  const byKey = new Map<string, ImportStock>();
  records.forEach((r, i) => {
    const ref = r.name || r.sku || `Row ${i + 2}`;
    const stock = parseStock(r.stock);
    if (stock === undefined) return;
    if (!r.sku && !r.name) {
      issues.push({ ref, message: "Needs a SKU or product name to match." });
      return;
    }
    const values = [r.option1Value, r.option2Value, r.option3Value]
      .map((v) => (v ?? "").trim())
      .filter((v) => v && v.toLowerCase() !== "default title");
    const key = [r.sku, r.name, ...values].join("|").toLowerCase();
    const repeat = sumRepeated ? byKey.get(key) : undefined;
    if (repeat) {
      repeat.stock += stock;
      return;
    }
    const item = { ref, sku: r.sku || null, name: r.name || null, values, stock };
    byKey.set(key, item);
    items.push(item);
  });
  return { entity: "inventory", items, issues };
}

/** Copies blank `keys` from the previous row onto rows without a product name. */
function fillDown(records: ImportRecord[], keys: string[]): ImportRecord[] {
  let prev: ImportRecord | null = null;
  return records.map((r) => {
    const rec = { ...r };
    if (prev && !rec.name?.trim()) {
      for (const k of keys) if (!rec[k]?.trim()) rec[k] = prev[k] ?? "";
    }
    prev = rec;
    return rec;
  });
}

/** Mapped records → validated import items for the chosen entity. */
export function buildImport(
  entity: ImportEntity,
  records: ImportRecord[],
  preset: ImportPreset | null,
): BuiltImport {
  if (entity === "customers") return buildCustomers(records);
  if (entity === "inventory") return buildStock(records, preset?.sumRepeatedStock === true);
  const prepare = preset?.prepare ?? prepareGeneric;
  const rows = preset?.fillDown ? fillDown(records, preset.fillDown) : records;
  const { products, issues } = groupProducts(rows.map((r) => prepare(r)));
  return { entity: "products", items: products, issues };
}
