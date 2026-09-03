import { HandoverMode } from "@/lib/ops/enums";
import type { OpsBoardOrder } from "@/lib/ops/board";
import { packingProgress, resolveOpsStatus } from "@/lib/ops/board";
import { OPS_STATUS_LABEL } from "@/lib/ops/status";
import { formatCollectionLabel } from "@/lib/pre-order";
import { paymentStatusNote } from "@/lib/order-payment-label";

export type OpsView =
  | "today"
  | "tomorrow"
  | "upcoming"
  | "ready"
  | "completed"
  | "all";

export const OPS_VIEWS: { id: OpsView; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

export function parseOpsView(raw: string | undefined): OpsView {
  const hit = OPS_VIEWS.find((v) => v.id === raw);
  return hit?.id ?? "today";
}

export function handoverOf(order: OpsBoardOrder): HandoverMode {
  return order.fulfilment?.handoverMode ?? order.handoverMode;
}

export function fulfilmentContext(order: OpsBoardOrder): string {
  const f = order.fulfilment;
  const parts: string[] = [];
  const handover = handoverOf(order);
  parts.push(handover === HandoverMode.DELIVER ? "Delivery" : "Pickup");
  if (f?.optionLabel) parts.push(f.optionLabel);
  const loc = f?.pickupPublicLabel || f?.pickupLocationName;
  if (loc) parts.push(loc);
  if (f?.windowLabel) parts.push(f.windowLabel);
  if (f?.deliveryZoneName) parts.push(f.deliveryZoneName);
  const when =
    order.collectionAt ?? f?.collectionStartsAt ?? null;
  if (when) parts.push(formatCollectionLabel(when));
  return parts.join(" · ");
}

export function deliveryAddressLine(order: OpsBoardOrder): string | null {
  if (handoverOf(order) !== HandoverMode.DELIVER) return null;
  const line = [
    order.deliveryAddressLine1,
    order.deliverySuburb,
    order.deliveryPostcode,
  ]
    .filter(Boolean)
    .join(", ");
  return line || null;
}

export type OpsCardOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  status: keyof typeof OPS_STATUS_LABEL;
  statusLabel: string;
  paymentLabel: string;
  context: string;
  addressLine: string | null;
  notes: string | null;
  customerNote: string | null;
  handover: HandoverMode;
  packed: number;
  total: number;
  items: {
    id: string;
    quantity: number;
    name: string;
    options: string | null;
    packed: boolean;
  }[];
};

export function toOpsCardOrder(order: OpsBoardOrder): OpsCardOrder {
  const status = resolveOpsStatus(order);
  const progress = packingProgress(order);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status,
    statusLabel: OPS_STATUS_LABEL[status],
    paymentLabel: paymentStatusNote(order.paymentStatus),
    context: fulfilmentContext(order),
    addressLine: deliveryAddressLine(order),
    notes: order.fulfilment?.sellerNotes ?? null,
    customerNote: order.collectionNote ?? order.deliveryNotes ?? null,
    handover: handoverOf(order),
    packed: progress.packed,
    total: progress.total,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      name: item.productNameSnapshot,
      options: item.optionsSnapshot,
      packed: Boolean(item.packedAt),
    })),
  };
}

export function batchPackingProgress(orders: OpsBoardOrder[]) {
  let packedOrders = 0;
  for (const order of orders) {
    const { packed, total } = packingProgress(order);
    if (total > 0 && packed === total) packedOrders += 1;
  }
  return { packedOrders, totalOrders: orders.length };
}

export function viewHref(view: OpsView, q: string | null, standId: string | null) {
  const params = new URLSearchParams({ view });
  if (q) params.set("q", q);
  if (standId) params.set("standId", standId);
  return `/dashboard/fulfilment/orders?${params.toString()}`;
}

export function printHref(
  kind: "packing" | "labels",
  view: OpsView,
  q: string | null,
  standId: string | null,
) {
  const params = new URLSearchParams({ view });
  if (q) params.set("q", q);
  if (standId) params.set("standId", standId);
  return `/dashboard/fulfilment/orders/print/${kind}?${params.toString()}`;
}

export function emptyOpsMessage(view: OpsView, hasQuery: boolean): string {
  if (hasQuery) return "No orders match that search.";
  switch (view) {
    case "today":
      return "Nothing due today. Check tomorrow or upcoming.";
    case "tomorrow":
      return "No orders scheduled for tomorrow.";
    case "upcoming":
      return "No upcoming orders past tomorrow.";
    case "ready":
      return "No orders marked ready yet.";
    case "completed":
      return "No collected or delivered orders in this list.";
    default:
      return "No paid orders on the board yet.";
  }
}
