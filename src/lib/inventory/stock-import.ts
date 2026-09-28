import { prisma } from "@/lib/prisma";
import { parseCsv } from "./parse-csv";
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS } from "./import-limits";

export type ImportLine = {
  line: number;
  label: string;
  name: string | null;
  current: number | null;
  next: number | null;
  issue: string | null;
};

export type ImportPlan = {
  lines: ImportLine[];
  counts: Map<string, number>;
  changes: number;
  unchanged: number;
  issues: number;
};

const COLUMN_ALIASES = {
  id: ["product id", "id"],
  sku: ["sku"],
  name: ["product", "product name", "name"],
  qty: ["on hand", "counted", "count", "quantity", "qty", "stock", "stock quantity"],
} as const;

function findColumn(headers: string[], aliases: readonly string[]): number {
  return headers.findIndex((h) => aliases.includes(h.trim().toLowerCase()));
}

function indexUnique<T>(items: T[], key: (item: T) => string | null) {
  const map = new Map<string, T | "ambiguous">();
  for (const item of items) {
    const k = key(item)?.trim().toLowerCase();
    if (!k) continue;
    map.set(k, map.has(k) ? "ambiguous" : item);
  }
  return map;
}

export async function planStockImport(input: {
  ownerId: string;
  standId: string;
  csv: string;
}): Promise<ImportPlan | { error: string }> {
  if (input.csv.length > MAX_IMPORT_BYTES) return { error: "File is too large (1 MB max)." };
  const [headers, ...rows] = parseCsv(input.csv);
  if (!headers) return { error: "The file is empty." };
  if (rows.length > MAX_IMPORT_ROWS) return { error: `Too many rows (${MAX_IMPORT_ROWS} max).` };

  const col = {
    id: findColumn(headers, COLUMN_ALIASES.id),
    sku: findColumn(headers, COLUMN_ALIASES.sku),
    name: findColumn(headers, COLUMN_ALIASES.name),
    qty: findColumn(headers, COLUMN_ALIASES.qty),
  };
  if (col.qty < 0) return { error: "Add an “On hand” column with the counted quantities." };
  if (col.id < 0 && col.sku < 0 && col.name < 0) {
    return { error: "Add a “Product ID”, “SKU”, or “Product” column to match products." };
  }

  const products = await prisma.product.findMany({
    where: { ownerId: input.ownerId, standId: input.standId, isArchived: false, isPreOrder: false },
    select: { id: true, name: true, sku: true, stockQuantity: true },
  });
  type P = (typeof products)[number];
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySku = indexUnique(products, (p) => p.sku);
  const byName = indexUnique(products, (p) => p.name);

  const lines: ImportLine[] = [];
  const counts = new Map<string, number>();
  rows.forEach((row, i) => {
    const get = (c: number) =>
      c >= 0 ? (row[c] ?? "").trim().replace(/^'(?=[=+\-@])/, "") : "";
    const rawQty = get(col.qty);
    if (rawQty === "") return;
    const id = get(col.id);
    const sku = get(col.sku);
    const name = get(col.name);
    const label = name || sku || id || `Row ${i + 2}`;
    const base = { line: i + 2, label, name: null, current: null, next: null };

    let match: P | "ambiguous" | undefined;
    if (id) match = byId.get(id);
    if (!match && sku) match = bySku.get(sku.toLowerCase());
    if (!match && name) match = byName.get(name.toLowerCase());

    if (match === "ambiguous") {
      lines.push({ ...base, issue: "Matches more than one product. Add a Product ID or unique SKU." });
      return;
    }
    if (!match) {
      lines.push({ ...base, issue: "No matching product in this business." });
      return;
    }
    if (!/^\d+$/.test(rawQty)) {
      lines.push({ ...base, name: match.name, current: match.stockQuantity, issue: `“${rawQty}” is not a whole number of 0 or more.` });
      return;
    }
    if (counts.has(match.id)) {
      lines.push({ ...base, name: match.name, issue: "Product is listed more than once. Only the first row is used." });
      return;
    }
    const next = Number.parseInt(rawQty, 10);
    counts.set(match.id, next);
    lines.push({ ...base, name: match.name, current: match.stockQuantity, next, issue: null });
  });

  const issues = lines.filter((l) => l.issue).length;
  const changes = lines.filter((l) => !l.issue && l.next !== l.current).length;
  return { lines, counts, changes, unchanged: counts.size - changes, issues };
}
