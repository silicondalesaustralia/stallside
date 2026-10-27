"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { markOrderPaid } from "./mark-paid-action";

export default function MarkPaidPanel({
  orderId,
  payAtPickup = false,
}: {
  orderId: string;
  payAtPickup?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm("Mark this order as paid? Only do this once the money has arrived.")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await markOrderPaid(orderId);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("Could not update the order. Try again.");
      }
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 text-sm">
      <p className="text-[var(--muted)]">
        {payAtPickup
          ? "This pre-order is paid at pickup. Mark it paid once you've taken the money."
          : "The shopper said they paid. Check your tin or bank, then mark it paid."}
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="self-start rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 font-semibold disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark paid"}
      </button>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
