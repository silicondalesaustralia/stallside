import type { InventoryRow } from "./load-inventory-report";
import { STOCK_STATUS_LABEL, supplyStatusLabel } from "./inventory-status";

function cell(value: string | number | null): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  const text = value;
  // Neutralise spreadsheet formula injection, then quote if needed.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function money(cents: number | null): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

function isoDate(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

const HEADERS = [
  "Product",
  "SKU",
  "Location",
  "Stock status",
  "Supply status",
  "On hand",
  "Low stock threshold",
  "Incoming",
  "Sold 7d",
  "Sold 30d",
  "Daily sale rate",
  "Days of cover",
  "Last sold",
  "Last counted",
  "Unit price",
  "Unit cost",
  "Stock value (cost)",
  "Stock value (retail)",
  "Currency",
  "Product ID",
];

export function inventoryRowsToCsv(rows: InventoryRow[]): string {
  const lines = rows.map((r) => {
    const onHand = Math.max(0, r.stockQuantity);
    return [
      r.name,
      r.sku,
      r.locationName,
      STOCK_STATUS_LABEL[r.stockStatus],
      supplyStatusLabel(r.supplyStatus),
      r.stockQuantity,
      r.lowStockThreshold,
      r.incoming,
      r.sold7,
      r.sold30,
      r.dailyRate.toFixed(2),
      r.daysCover == null ? null : r.daysCover.toFixed(1),
      isoDate(r.lastSoldAt),
      isoDate(r.lastCountedAt),
      money(r.priceCents),
      money(r.costCents),
      money(r.costCents == null ? null : r.costCents * onHand),
      money(r.priceCents * onHand),
      r.currency,
      r.id,
    ]
      .map(cell)
      .join(",");
  });
  // BOM so Excel opens UTF-8 correctly.
  return "\uFEFF" + [HEADERS.join(","), ...lines].join("\r\n");
}

/** Import template: one row per product with a blank "On hand" column to fill in. */
export function inventoryTemplateCsv(
  products: { id: string; name: string; sku: string | null; stockQuantity: number }[],
): string {
  const headers = ["Product", "SKU", "Current stock", "On hand", "Product ID"];
  const lines = products.map((p) =>
    [p.name, p.sku, p.stockQuantity, "", p.id].map(cell).join(","),
  );
  return "\uFEFF" + [headers.join(","), ...lines].join("\r\n");
}
