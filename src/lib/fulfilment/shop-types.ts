/** Client-safe fulfilment option shape for shop picker (no Prisma imports). */
export type ShopFulfilmentOptionView = {
  id: string;
  kind: string;
  label: string;
  feeCents: number;
  pickupLocation: { publicLabel: string | null; suburb: string | null } | null;
  pickupWindow: {
    recurrence: string;
    label: string | null;
    weekday: number | null;
    startTimeMin: number | null;
    endTimeMin: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
  } | null;
  deliveryZone: {
    name: string;
    deliveryFeeCents: number;
    minOrderCents: number;
  } | null;
};

export function toShopFulfilmentOptionView(
  option: import("@/lib/fulfilment/load-options").ShopFulfilmentOption,
): ShopFulfilmentOptionView {
  return {
    id: option.id,
    kind: option.kind,
    label: option.label,
    feeCents: option.feeCents,
    pickupLocation: option.pickupLocation,
    pickupWindow: option.pickupWindow,
    deliveryZone: option.deliveryZone,
  };
}
