"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { StripeSetupBanner } from "@/lib/load-stripe-setup-banner";

const STRIPE_SETTINGS_HREF = "/dashboard/settings/stripe";

const STORAGE_KEY = "vendl-stripe-setup-banner-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function StripeSetupBannerClient({ banner }: { banner: StripeSetupBanner }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const urgent = banner.mode === "restricted";

  useEffect(() => {
    setCollapsed(readCollapsed());
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  if (!hydrated) {
    return (
      <div
        className="mb-4 h-[4.5rem] rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] print:hidden"
        aria-hidden
      />
    );
  }

  if (collapsed) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 print:hidden">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="relative inline-flex items-center gap-2 text-left text-sm font-semibold text-[var(--field)]"
        >
          <span
            className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--gone)]"
            aria-hidden
          />
          <span className="pl-3">{banner.title}</span>
          <span className="text-xs font-medium text-[var(--muted)]">Show details</span>
        </button>
        <Link
          href={STRIPE_SETTINGS_HREF}
          className="relative inline-flex shrink-0 rounded-full bg-[var(--marigold)] px-4 py-2 text-sm font-bold text-[var(--field)] shadow-[0_2px_12px_-4px_rgb(23_54_31_/_0.35)] transition hover:brightness-95"
        >
          {banner.ctaLabel}
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel)] bg-[var(--gone)]"
            aria-hidden
          />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`mb-4 rounded-[var(--radius-card)] border p-4 print:hidden ${
        urgent
          ? "border-amber-300 bg-amber-50"
          : "border-[var(--line)] bg-[var(--panel)]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                urgent ? "text-amber-900" : "text-[var(--muted)]"
              }`}
            >
              {urgent ? "Action required" : "Optional setup"}
            </p>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="shrink-0 text-xs font-semibold text-[var(--muted)] underline hover:text-[var(--field)]"
            >
              Collapse
            </button>
          </div>
          <h2
            className={`mt-1 font-[family-name:var(--font-display)] text-lg font-bold ${
              urgent ? "text-amber-950" : "text-[var(--ink)]"
            }`}
          >
            {banner.title}
          </h2>
          <p
            className={`mt-1 text-sm ${
              urgent ? "text-amber-950/85" : "text-[var(--muted)]"
            }`}
          >
            {banner.body}
          </p>
          <p
            className={`mt-3 text-sm font-semibold ${
              urgent ? "text-amber-950" : "text-[var(--ink)]"
            }`}
          >
            {banner.mode === "restricted" ? "Still needed:" : "Steps:"}
          </p>
          <ul
            className={`mt-1 list-inside list-disc text-sm ${
              urgent ? "text-amber-950/90" : "text-[var(--muted)]"
            }`}
          >
            {banner.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <Link
          href={STRIPE_SETTINGS_HREF}
          className="inline-flex shrink-0 rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)] shadow-[0_2px_12px_-4px_rgb(23_54_31_/_0.35)] transition hover:brightness-95"
        >
          {banner.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
