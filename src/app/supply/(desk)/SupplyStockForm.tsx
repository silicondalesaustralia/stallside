"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { adjustSupplierStock } from "./adjust-stock";

export default function SupplyStockForm({
  productId,
  standId,
}: {
  productId: string;
  standId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await adjustSupplierStock(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Stock updated. The owner has been notified.");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="standId" value={standId} />
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Change</span>
        <select
          name="mode"
          className="rounded-lg border border-[var(--line)] px-3 py-2"
          defaultValue="increase"
        >
          <option value="increase">Add</option>
          <option value="decrease">Remove</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Quantity</span>
        <input
          name="amount"
          type="number"
          min={1}
          required
          className="w-24 rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Saving…" : "Update stock"}
      </button>
      {message ? <p className="w-full text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
