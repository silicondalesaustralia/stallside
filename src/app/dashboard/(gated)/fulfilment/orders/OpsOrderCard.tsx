"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FulfilmentStatus } from "@/lib/ops/enums";
import {
  canTransitionOps,
  nextHandoverStatus,
  OPS_STATUS_LABEL,
} from "@/lib/ops/status";
import { bulkSetOpsStatus, toggleItemPacked } from "./actions";
import type { OpsCardOrder } from "./ops-display";

export default function OpsOrderCard({
  order,
  selected,
  onSelect,
}: {
  order: OpsCardOrder;
  selected: boolean;
  onSelect: (id: string, next: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const status = order.status as FulfilmentStatus;
  const handoverNext = nextHandoverStatus(status, order.handover);

  function setStatus(next: FulfilmentStatus) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("status", next);
      fd.append("orderIds", order.id);
      await bulkSetOpsStatus(fd);
      router.refresh();
    });
  }

  function togglePacked(itemId: string, packed: boolean) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("orderItemId", itemId);
      fd.set("packed", packed ? "1" : "0");
      await toggleItemPacked(fd);
      router.refresh();
    });
  }

  const btn =
    "rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--leaf)] disabled:opacity-50";

  return (
    <article className="dash-card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(order.id, e.target.checked)}
            className="mt-1 size-4"
          />
          <span>
            <Link
              href={`/dashboard/fulfilment/orders/${order.id}`}
              className="font-semibold text-[var(--field)] underline-offset-2 hover:underline"
            >
              {order.customerName ?? "Customer"} · #{order.orderNumber}
            </Link>
            <p className="mt-0.5 text-sm text-[var(--muted)]">{order.context}</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {order.statusLabel} · {order.paymentLabel}
              {order.total > 0
                ? ` · ${order.packed}/${order.total} packed`
                : ""}
            </p>
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              pending || !canTransitionOps(status, FulfilmentStatus.PREPARING)
            }
            className={btn}
            onClick={() => setStatus(FulfilmentStatus.PREPARING)}
          >
            Preparing
          </button>
          <button
            type="button"
            disabled={
              pending || !canTransitionOps(status, FulfilmentStatus.READY)
            }
            className={btn}
            onClick={() => setStatus(FulfilmentStatus.READY)}
          >
            Packed / Ready
          </button>
          {handoverNext ? (
            <button
              type="button"
              disabled={pending || !canTransitionOps(status, handoverNext)}
              className={btn}
              onClick={() => setStatus(handoverNext)}
            >
              {OPS_STATUS_LABEL[handoverNext]}
            </button>
          ) : null}
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 border-t border-[var(--line)] pt-3">
        {order.items.map((item) => (
          <li key={item.id}>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.packed}
                disabled={pending}
                onChange={(e) => togglePacked(item.id, e.target.checked)}
                className="mt-0.5 size-4"
              />
              <span>
                {item.quantity}× {item.name}
                {item.options ? ` (${item.options})` : ""}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {order.customerNote ? (
        <p className="text-sm text-[var(--muted)]">Note: {order.customerNote}</p>
      ) : null}
      {order.notes ? (
        <p className="text-sm text-[var(--muted)]">Seller: {order.notes}</p>
      ) : null}
      {order.addressLine ? (
        <p className="text-sm text-[var(--muted)]">{order.addressLine}</p>
      ) : null}
    </article>
  );
}
