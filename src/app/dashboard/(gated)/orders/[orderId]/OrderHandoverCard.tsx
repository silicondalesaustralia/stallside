import DetailCard from "@/components/dashboard/ui/DetailCard";
import { formatDateInTz } from "@/lib/stand-timezone";
import type { OrderDetail } from "@/lib/orders/load-order-detail";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/** Where the order goes: delivery address or pickup details. */
export default function OrderHandoverCard({ order, timeZone }: { order: OrderDetail; timeZone: string }) {
  const f = order.fulfilment;
  const deliver = order.handoverMode === "DELIVER";
  const address = [
    order.deliveryAddressLine1,
    [order.deliverySuburb, order.deliveryPostcode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <DetailCard title={deliver ? "Delivery" : "Pickup"}>
      <div className="space-y-3 text-sm">
        {f?.optionLabel ? <Field label="Method">{f.optionLabel}</Field> : null}
        {deliver ? (
          <Field label="Ship to">
            {address.length ? address.map((line) => <p key={line}>{line}</p>) : "No address given"}
          </Field>
        ) : f?.pickupLocationName || f?.pickupAddressSnapshot ? (
          <Field label="Pickup location">
            {f.pickupLocationName ? <p>{f.pickupLocationName}</p> : null}
            {f.pickupAddressSnapshot ? <p className="text-[var(--muted)]">{f.pickupAddressSnapshot}</p> : null}
          </Field>
        ) : (
          <p className="text-[var(--muted)]">Collected from {order.stand.name}</p>
        )}
        {f?.windowLabel ? <Field label="Window">{f.windowLabel}</Field> : null}
        {f?.deliveryZoneName ? <Field label="Zone">{f.deliveryZoneName}</Field> : null}
        {order.collectionAt ? (
          <Field label="Collection">
            {formatDateInTz(order.collectionAt, timeZone, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Field>
        ) : null}
        {order.deliveryNotes || order.collectionNote ? (
          <Field label="Customer notes">{order.deliveryNotes ?? order.collectionNote}</Field>
        ) : null}
      </div>
    </DetailCard>
  );
}
