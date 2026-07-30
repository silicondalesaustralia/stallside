"use client";

import type { PreOrderDetailsData } from "@/lib/public-product";

export default function PreOrderDetails({
  details,
}: {
  details: PreOrderDetailsData;
}) {
  return (
    <ul className="mt-2 space-y-2 text-sm leading-snug text-[var(--muted)]">
      {details.ordersCloseLabel ? (
        <li>
          <span className="font-semibold text-[var(--ink)]">Orders close:</span>{" "}
          {details.ordersCloseLabel}
        </li>
      ) : null}
      <li>
        <span className="font-semibold text-[var(--ink)]">Collection:</span>{" "}
        {details.collectionLabel}
      </li>
      {details.note ? (
        <li>
          <span className="font-semibold text-[var(--ink)]">Notes:</span>{" "}
          {details.note}
        </li>
      ) : null}
    </ul>
  );
}
