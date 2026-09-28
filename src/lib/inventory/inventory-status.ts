import type { ProductSupplyStatus } from "@/generated/prisma/client";

export type StockStatus = "in_stock" | "low" | "out";

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export const SUPPLY_STATUS_OPTIONS: { value: ProductSupplyStatus; label: string }[] = [
  { value: "IN_PRODUCTION", label: "In production" },
  { value: "ON_ORDER", label: "On order" },
  { value: "SEASONAL", label: "Seasonal / paused" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

export function supplyStatusLabel(status: ProductSupplyStatus | null): string | null {
  if (!status) return null;
  return SUPPLY_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? null;
}

export function isSupplyStatus(value: string): value is ProductSupplyStatus {
  return SUPPLY_STATUS_OPTIONS.some((o) => o.value === value);
}

export function stockStatusFor(quantity: number, lowThreshold: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= lowThreshold) return "low";
  return "in_stock";
}

/** Report filter ids: derived stock statuses, supply statuses, or "incoming". */
export const INVENTORY_FILTERS: { id: string; label: string }[] = [
  { id: "in_stock", label: "In stock" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
  { id: "incoming", label: "Incoming" },
  ...SUPPLY_STATUS_OPTIONS.map((o) => ({ id: o.value, label: o.label })),
];
