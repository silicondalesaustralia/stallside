"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ProductSupplyStatus } from "@/generated/prisma/client";
import { SUPPLY_STATUS_OPTIONS } from "@/lib/inventory/inventory-status";
import { setProductSupplyStatus } from "../../inventory/inventory-actions";

export default function SupplyStatusSelect({
  productId,
  value,
}: {
  productId: string;
  value: ProductSupplyStatus | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("supplyStatus", next);
    setMessage(null);
    startTransition(async () => {
      const result = await setProductSupplyStatus(formData);
      setMessage("error" in result ? result.error : "Saved.");
      router.refresh();
    });
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold">Inventory status</span>
      <select
        defaultValue={value ?? ""}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm disabled:opacity-60"
      >
        <option value="">None</option>
        {SUPPLY_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-[var(--muted)]">
        {message ?? "Shown on the inventory report alongside the stock level."}
      </span>
    </label>
  );
}
