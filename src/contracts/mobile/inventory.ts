import { z } from "zod";

export const inventoryQuery = z.object({
  standId: z.string().min(1),
  q: z.string().trim().max(100).optional(),
});
export type InventoryQuery = z.infer<typeof inventoryQuery>;

export const stockStatus = z.enum(["in_stock", "low", "out"]);
export type StockStatus = z.infer<typeof stockStatus>;

export const inventoryRow = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable(),
  stockQuantity: z.number().int(),
  lowStockThreshold: z.number().int(),
  stockStatus,
  supplyStatusLabel: z.string().nullable(),
  incoming: z.number().int(),
  sold30: z.number().int(),
  daysCover: z.number().nullable(),
  lastSoldAt: z.iso.datetime().nullable(),
  variantCount: z.number().int(),
});
export type InventoryRow = z.infer<typeof inventoryRow>;

export const inventorySummary = z.object({
  products: z.number().int(),
  low: z.number().int(),
  out: z.number().int(),
  runningOut: z.number().int(),
  costValueCents: z.number().int(),
  retailValueCents: z.number().int(),
  missingCost: z.number().int(),
  sold30: z.number().int(),
  currency: z.string(),
});
export type InventorySummary = z.infer<typeof inventorySummary>;

export const inventoryResponse = z.object({
  summary: inventorySummary,
  rows: z.array(inventoryRow),
});
export type InventoryResponse = z.infer<typeof inventoryResponse>;
