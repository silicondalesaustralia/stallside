"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOrder } from "./actions";

export default function OrderDeleteButton({
  orderId,
  orderNumber,
  restoresStock,
}: {
  orderId: string;
  orderNumber: string;
  restoresStock: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    const stockNote = restoresStock
      ? " Stock for this sale will be put back."
      : "";
    const ok = window.confirm(
      `Delete order ${orderNumber}? This cannot be undone.${stockNote}`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteOrder(orderId);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="rounded-full bg-[var(--gone)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--gone)] disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
