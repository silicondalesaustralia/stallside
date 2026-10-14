import type { HandoverMode } from "@/generated/prisma/client";

export type OrderDeliveryFields = {
  handoverMode: HandoverMode;
  isPreOrder: boolean;
  deliveryAddressLine1: string | null;
  deliverySuburb: string | null;
  deliveryPostcode: string | null;
  deliveryNotes: string | null;
};

/** "Ship to …" (or "Deliver to …" for pre-order deliveries); nothing for pickups. */
export default function OrderDeliveryLine({ order }: { order: OrderDeliveryFields }) {
  if (order.handoverMode !== "DELIVER") return null;
  const address = [order.deliveryAddressLine1, [order.deliverySuburb, order.deliveryPostcode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return (
    <p className="mt-2 text-sm">
      <span className="font-semibold">{order.isPreOrder ? "Deliver to:" : "Ship to:"}</span> {address || "No address given"}
      {order.deliveryNotes ? <span className="text-[var(--muted)]"> · {order.deliveryNotes}</span> : null}
    </p>
  );
}
