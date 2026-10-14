import type { HandoverMode } from "@/generated/prisma/client";

export type OrderDeliveryFields = {
  handoverMode: HandoverMode;
  deliveryAddressLine1: string | null;
  deliverySuburb: string | null;
  deliveryPostcode: string | null;
  deliveryNotes: string | null;
};

/** "Deliver to …" for delivery orders; nothing for pickups. */
export default function OrderDeliveryLine({ order }: { order: OrderDeliveryFields }) {
  if (order.handoverMode !== "DELIVER") return null;
  const address = [order.deliveryAddressLine1, [order.deliverySuburb, order.deliveryPostcode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return (
    <p className="mt-2 text-sm">
      <span className="font-semibold">Deliver to:</span> {address || "No address given"}
      {order.deliveryNotes ? <span className="text-[var(--muted)]"> · {order.deliveryNotes}</span> : null}
    </p>
  );
}
