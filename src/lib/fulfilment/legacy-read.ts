import type { Order, OrderFulfilment } from "@/generated/prisma/client";
import { formatCollectionLabel } from "@/lib/pre-order";

/** Prefer OrderFulfilment snapshot; fallback to legacy Order fields. */
export function resolveOrderCollectionAt(
  order: Pick<Order, "collectionAt">,
  fulfilment?: Pick<OrderFulfilment, "collectionStartsAt"> | null,
): Date | null {
  return fulfilment?.collectionStartsAt ?? order.collectionAt;
}

export function resolveOrderCollectionLabel(
  order: Pick<Order, "collectionAt" | "collectionNote">,
  fulfilment?: Pick<
    OrderFulfilment,
    "collectionStartsAt" | "windowLabel" | "optionLabel" | "pickupPublicLabel"
  > | null,
  timeZone?: string,
): string {
  if (fulfilment?.windowLabel) {
    const place = fulfilment.pickupPublicLabel;
    return place
      ? `${fulfilment.windowLabel} · ${place}`
      : fulfilment.windowLabel;
  }
  if (fulfilment?.optionLabel && fulfilment.collectionStartsAt) {
    return fulfilment.optionLabel;
  }
  const at = resolveOrderCollectionAt(order, fulfilment);
  if (!at) return order.collectionNote ?? "";
  return formatCollectionLabel(at, timeZone);
}

export function resolveOrderGroupKey(
  order: Pick<Order, "collectionAt" | "id">,
  fulfilment?: Pick<
    OrderFulfilment,
    "collectionStartsAt" | "pickupLocationName" | "pickupPublicLabel"
  > | null,
): string {
  const at = resolveOrderCollectionAt(order, fulfilment);
  const day = at?.toISOString().slice(0, 10) ?? "unknown";
  const loc =
    fulfilment?.pickupLocationName ??
    fulfilment?.pickupPublicLabel ??
    "default";
  return `${day}:${loc}`;
}
