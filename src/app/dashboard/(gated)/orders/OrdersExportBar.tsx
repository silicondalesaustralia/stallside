"use client";

import { useState } from "react";

const linkClass =
  "rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]";

export default function OrdersExportBar({
  range,
  from,
  to,
}: {
  range: string;
  from: string;
  to: string;
}) {
  const [includeAll, setIncludeAll] = useState(false);

  function href(kind: "orders" | "items") {
    const params = new URLSearchParams({ range, from, to, kind });
    if (includeAll) params.set("status", "all");
    return `/dashboard/orders/export?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="font-semibold">Export this range:</span>
      <a href={href("orders")} download className={linkClass}>
        Orders CSV
      </a>
      <a href={href("items")} download className={linkClass}>
        Line items CSV
      </a>
      <label className="flex items-center gap-2 text-[var(--muted)]">
        <input
          type="checkbox"
          checked={includeAll}
          onChange={(e) => setIncludeAll(e.target.checked)}
        />
        Include unpaid, abandoned and refunded
      </label>
    </div>
  );
}
