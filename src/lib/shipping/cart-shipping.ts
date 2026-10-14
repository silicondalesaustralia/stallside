import {
  shippingCostCents,
  standShippingSettings,
  type ShippingModeValue,
} from "@/lib/shipping/shipping-cost";

/** Shipping on a loaded cart. Only shop orders that ship are charged; pre-order deliveries keep their page's terms. */
export function loadedCartShippingCents(
  loaded: {
    stand: { shippingMode: ShippingModeValue; shippingFlatCents: number; shippingFreeOverCents: number | null };
    byId: Map<string, { shippingCents: number | null }>;
    lineData: { productId: string; quantity: number }[];
    totalCents: number;
    preOrderCart: unknown;
  },
  shipping: boolean,
): number {
  if (!shipping || loaded.preOrderCart) return 0;
  const lines = loaded.lineData.map((line) => ({
    shippingCents: loaded.byId.get(line.productId)?.shippingCents ?? null,
    quantity: line.quantity,
  }));
  return shippingCostCents(standShippingSettings(loaded.stand), lines, loaded.totalCents);
}
