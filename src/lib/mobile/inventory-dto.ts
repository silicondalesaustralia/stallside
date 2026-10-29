import type { InventoryResponse } from "@/contracts/mobile/inventory";
import type { InventoryRow } from "@/lib/inventory/load-inventory-report";
import { supplyStatusLabel } from "@/lib/inventory/inventory-status";
import { summarizeInventory } from "@/lib/inventory/summary";

export function toInventoryResponse(rows: InventoryRow[], variantCounts: Map<string, number>): InventoryResponse {
  return {
    summary: summarizeInventory(rows),
    rows: rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      stockQuantity: row.stockQuantity,
      lowStockThreshold: row.lowStockThreshold,
      stockStatus: row.stockStatus,
      supplyStatusLabel: supplyStatusLabel(row.supplyStatus),
      incoming: row.incoming,
      sold30: row.sold30,
      daysCover: row.daysCover,
      lastSoldAt: row.lastSoldAt?.toISOString() ?? null,
      variantCount: variantCounts.get(row.id) ?? 0,
    })),
  };
}
