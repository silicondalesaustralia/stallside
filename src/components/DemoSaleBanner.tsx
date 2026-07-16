"use client";

import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
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
      <div className="flex gap-2.5 rounded-2xl border border-black/8 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgb(0_0_0/0.12)]">
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
              {APP_NAME}
            </p>
            <p className="shrink-0 text-[11px] text-[var(--muted)]">now</p>
          </div>
          <p className="mt-0.5 truncate text-[13px] font-medium leading-snug text-[var(--field)]">
            New sale
            {amount ? ` · ${amount}` : ""}
          </p>
          <p className="mt-0.5 truncate text-xs leading-snug text-[var(--muted)]">
            {standName} · {method}
          </p>
        </div>
      </div>
    </div>
  );
}
