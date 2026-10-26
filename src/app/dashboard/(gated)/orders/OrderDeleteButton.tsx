"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dangerButtonClass } from "@/components/dashboard/ui/button-styles";
import { deleteOrder } from "./actions";

export default function OrderDeleteButton({
  orderId,
  orderNumber,
  restoresStock,
  redirectTo,
}: {
  orderId: string;
  orderNumber: string;
  restoresStock: boolean;
  /** Where to go after deleting (the order page itself no longer exists). */
  redirectTo?: string;
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
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className={dangerButtonClass}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
