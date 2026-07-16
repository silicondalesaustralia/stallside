"use client";

import { formatMoney } from "@/lib/money";

export default function DemoSaleBanner({
  visible,
  via,
  totalCents,
  currency,
  standName,
}: {
  visible: boolean;
  via: string;
  totalCents?: number;
  currency?: string;
  standName: string;
}) {
  const amount =
    totalCents != null && currency
      ? formatMoney(totalCents, currency)
      : null;
  const method =
    via === "local_transfer"
      ? "PayID"
      : via === "card"
        ? "Card"
        : "Cash";

  return (
    <div
      className={`pointer-events-none absolute inset-x-2 top-9 z-30 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[120%] opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-white/20 bg-[var(--field)]/95 px-3 py-2.5 text-[var(--ink-on-dark)] shadow-lg backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-on-dark)]/70">
          Stallside · New sale
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-tight">
          {standName}
          {amount ? ` · ${amount}` : ""}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-on-dark)]/75">
          {method} confirmed — you&apos;re alerted
        </p>
      </div>
    </div>
  );
}
