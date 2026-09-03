"use client";

import { useState } from "react";
import OpsBulkBar from "./OpsBulkBar";
import OpsOrderCard from "./OpsOrderCard";
import type { OpsCardOrder } from "./ops-display";

export default function OpsBoardClient({ orders }: { orders: OpsCardOrder[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function onSelect(id: string, next: boolean) {
    setSelected((prev) =>
      next ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OpsBulkBar selectedIds={selected} onClear={() => setSelected([])} />
      {orders.map((order) => (
        <OpsOrderCard
          key={order.id}
          order={order}
          selected={selected.includes(order.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
