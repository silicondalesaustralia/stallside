"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/money";
import { checkPayPalRefund } from "./refund-actions";

export default function PayPalRefundPanel({
  orderId,
  refundUrl,
  refundedCents,
  totalCents,
  currency,
}: {
  orderId: string;
  refundUrl: string;
  refundedCents: number | null;
  totalCents: number;
  currency: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const partial = refundedCents != null && refundedCents > 0 && refundedCents < totalCents;

  function onCheck() {
    setMessage(null);
    startTransition(async () => {
      const result = await checkPayPalRefund(orderId);
      setMessage(result.message);
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      {partial ? (
        <span className="rounded-full bg-[var(--marigold)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--field)]">
          Partially refunded {formatMoney(refundedCents, currency)}
        </span>
      ) : null}
      <a
        href={refundUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold"
      >
        Refund in PayPal
      </a>
      <button
        type="button"
        onClick={onCheck}
        disabled={pending}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
      >
        {pending ? "Checking…" : "Check refund status"}
      </button>
      {message ? <span className="text-[var(--muted)]">{message}</span> : null}
    </div>
  );
}
