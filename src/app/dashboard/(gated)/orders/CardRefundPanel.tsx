"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/money";
import { refundCardOrder } from "./refund-actions";

const buttonClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold disabled:opacity-50";

function toCents(value: string): number | null {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

export default function CardRefundPanel({
  orderId,
  provider,
  remainingCents,
  currency,
}: {
  orderId: string;
  provider: "Stripe" | "Square";
  remainingCents: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((remainingCents / 100).toFixed(2));
  const [restock, setRestock] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cents = toCents(amount);
  const isFull = cents === remainingCents;
  const valid = cents != null && cents <= remainingCents;

  function onRefund() {
    if (!valid || cents == null) return;
    setMessage(null);
    startTransition(async () => {
      const result = await refundCardOrder({ orderId, amountCents: cents, restock: isFull && restock });
      setMessage(result.message);
      if (result.ok) setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
          Refund
        </button>
        {message ? <span className="text-[var(--muted)]">{message}</span> : null}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-[var(--line)] bg-white p-3 text-sm">
      <label className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">Refund amount</span>
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          max={(remainingCents / 100).toFixed(2)}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 rounded-lg border border-[var(--line)] px-2 py-1"
        />
        <span className="text-[var(--muted)]">
          of {formatMoney(remainingCents, currency)} left
        </span>
      </label>
      {isFull ? (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
          Return items to stock
        </label>
      ) : null}
      <p className="text-xs text-[var(--muted)]">
        Goes back to the customer&apos;s card through {provider}. This can&apos;t be undone.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefund}
          disabled={!valid || pending}
          className="rounded-lg bg-[var(--field)] px-3 py-1.5 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Refunding…" : valid ? `Refund ${formatMoney(cents, currency)}` : "Refund"}
        </button>
        <button type="button" className={buttonClass} onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </button>
        {message ? <span className="text-[var(--muted)]">{message}</span> : null}
      </div>
    </div>
  );
}
