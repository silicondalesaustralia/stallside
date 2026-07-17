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
  onDismiss,
  dismissible = true,
  surface = "solid",
}: {
  visible: boolean;
  via: string;
  totalCents?: number;
  currency?: string;
  standName: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  surface?: "solid" | "frosted";
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
  const frosted = surface === "frosted";

  return (
    <div
      className={`absolute inset-x-2 top-9 z-30 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[120%] opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`relative flex gap-2.5 rounded-2xl border py-2.5 pl-3 ${
          frosted
            ? "border-[var(--marigold)]/80 bg-[rgb(60_60_67/0.42)] shadow-[0_4px_12px_rgb(0_0_0/0.12)] backdrop-blur-2xl"
            : "border-black/8 bg-white shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
        } ${dismissible ? "pr-9" : "pr-3"}`}
      >
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={`truncate text-[13px] font-semibold ${
                frosted ? "text-white" : "text-[var(--ink)]"
              }`}
            >
              {APP_NAME}
            </p>
            <p
              className={`shrink-0 text-[11px] ${
                frosted ? "text-white/70" : "text-[var(--muted)]"
              }`}
            >
              now
            </p>
          </div>
          <p
            className={`mt-0.5 truncate text-[13px] font-medium leading-snug ${
              frosted ? "text-white" : "text-[var(--field)]"
            }`}
          >
            New sale
            {amount ? ` · ${amount}` : ""}
          </p>
          <p
            className={`mt-0.5 truncate text-xs leading-snug ${
              frosted ? "text-white/75" : "text-[var(--muted)]"
            }`}
          >
            {standName} · {method}
          </p>
        </div>
        {dismissible && onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-lg leading-none transition ${
              frosted
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"
            }`}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
