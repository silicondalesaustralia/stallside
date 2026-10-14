export type ShippingModeValue = "FREE" | "FLAT" | "CUSTOM";

export type ShippingSettings = {
  mode: ShippingModeValue;
  flatCents: number;
  freeOverCents: number | null;
};

export const SHIPPING_MODE_LABELS: Record<ShippingModeValue, string> = {
  FREE: "Free shipping",
  FLAT: "Flat rate",
  CUSTOM: "Custom - per product",
};

export function parseShippingMode(value: unknown): ShippingModeValue | null {
  return value === "FREE" || value === "FLAT" || value === "CUSTOM" ? value : null;
}

/** Shipping for a shipped cart: free, one flat amount, or each product's rate × quantity; free over the threshold. */
export function shippingCostCents(
  settings: ShippingSettings,
  lines: { shippingCents: number | null; quantity: number }[],
  goodsCents: number,
): number {
  if (settings.mode === "FREE") return 0;
  if (settings.freeOverCents != null && goodsCents >= settings.freeOverCents) return 0;
  if (settings.mode === "FLAT") return Math.max(0, settings.flatCents);
  return lines.reduce((sum, line) => sum + Math.max(0, line.shippingCents ?? 0) * line.quantity, 0);
}

export function standShippingSettings(stand: {
  shippingMode: ShippingModeValue;
  shippingFlatCents: number;
  shippingFreeOverCents: number | null;
}): ShippingSettings {
  return {
    mode: stand.shippingMode,
    flatCents: stand.shippingFlatCents,
    freeOverCents: stand.shippingFreeOverCents,
  };
}
