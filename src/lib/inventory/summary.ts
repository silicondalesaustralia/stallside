import type { InventoryRow } from "@/lib/inventory/load-inventory-report";

export type InventorySummary = {
  products: number;
  low: number;
  out: number;
  runningOut: number;
  costValueCents: number;
  retailValueCents: number;
  missingCost: number;
  sold30: number;
  currency: string;
};

export function summarizeInventory(rows: InventoryRow[]): InventorySummary {
  let costValueCents = 0;
  let retailValueCents = 0;
  let missingCost = 0;
  let sold30 = 0;
  for (const r of rows) {
    const onHand = Math.max(0, r.stockQuantity);
    retailValueCents += r.priceCents * onHand;
    if (r.costCents == null) missingCost += 1;
    else costValueCents += r.costCents * onHand;
    sold30 += r.sold30;
  }
  return {
    products: rows.length,
    low: rows.filter((r) => r.stockStatus === "low").length,
    out: rows.filter((r) => r.stockStatus === "out").length,
    runningOut: rows.filter((r) => r.daysCover != null && r.daysCover <= 7).length,
    costValueCents,
    retailValueCents,
    missingCost,
    sold30,
    currency: rows[0]?.currency ?? "AUD",
  };
}
