"use client";

import { useActionState } from "react";
import { SHIPPING_CARRIERS } from "@/lib/shipping/carriers";
import { markOrderDelivered, markOrderShipped } from "./shipping-actions";

export type OrderShippingFields = {
  id: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
};

const field = "rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** Tracking + "shipped" / "delivered" emails for a paid shipped order. */
export default function OrderShippingPanel({ order }: { order: OrderShippingFields }) {
  const [shipState, shipAction, shipping] = useActionState(markOrderShipped.bind(null, order.id), null);
  const [deliverState, deliverAction, delivering] = useActionState(markOrderDelivered.bind(null, order.id), null);
  const message = deliverState ?? shipState;
  const status = order.deliveredAt ? "Delivered" : order.shippedAt ? "Shipped" : "Not shipped yet";

  return (
    <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--wash)] px-3 py-3 text-sm">
      <p>
        <span className="font-semibold">Shipping:</span> {status}
        {order.trackingNumber ? ` · ${order.shippingCarrier ?? ""} ${order.trackingNumber}` : ""}
        {order.trackingUrl ? (
          <>
            {" · "}
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="underline">
              Track
            </a>
          </>
        ) : null}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold">
          {order.shippedAt ? "Edit tracking" : "Add tracking & mark shipped"}
        </summary>
        <form action={shipAction} className="mt-2 flex flex-wrap items-end gap-2">
          <select name="carrier" defaultValue={order.shippingCarrier ?? "Australia Post"} className={field}>
            {SHIPPING_CARRIERS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="Tracking number" className={field} />
          <input name="trackingUrl" placeholder="Tracking link (optional)" className={field} />
          <button type="submit" disabled={shipping} className="rounded-full bg-[var(--leaf)] px-4 py-2 font-semibold text-white disabled:opacity-50">
            {shipping ? "Saving…" : "Save & email customer"}
          </button>
        </form>
      </details>
      {order.shippedAt && !order.deliveredAt ? (
        <form action={deliverAction} className="mt-2">
          <button type="submit" disabled={delivering} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 font-semibold disabled:opacity-50">
            {delivering ? "Saving…" : "Mark delivered & email customer"}
          </button>
        </form>
      ) : null}
      {message?.ok ? <p className="mt-2 text-[var(--ok)]">{message.ok}</p> : null}
      {message?.error ? <p className="mt-2 text-[var(--gone)]">{message.error}</p> : null}
    </div>
  );
}
