"use client";

import BrandMark from "@/components/BrandMark";
import HeroOwnerPhoneAlert from "@/components/HeroOwnerPhoneAlert";

/** Customer checkout → owner sale alert. Stacks until 2xl; then cart | = | phone. */
export default function HeroCheckoutDemo() {
  return (
    <div className="hero-phone relative w-full max-w-none">
      <div
        aria-hidden
        className="hero-bracket absolute -bottom-2 -right-2 size-12 border-b-[3px] border-r-[3px] border-[var(--ink-on-dark)]/45 sm:size-14"
        style={{ borderBottomRightRadius: 10 }}
      />
      <div className="flex flex-col items-stretch gap-4 2xl:flex-row 2xl:items-center 2xl:gap-5">
        <div className="@container w-full min-w-0 overflow-hidden rounded-[24px] border-[5px] border-[var(--ink-on-dark)]/90 bg-[var(--panel)] shadow-[0_20px_50px_rgb(0_0_0/0.4)] 2xl:min-w-[22rem] 2xl:flex-1">
          <div className="bg-[var(--wash)] px-4 py-4 text-[var(--ink)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <BrandMark className="size-6 shrink-0" />
                <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
                  Green Valley Eggs
                </p>
              </div>
              <p className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Customer
              </p>
            </div>

            <div className="mt-3 grid gap-3 @[22rem]:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  1. Pick
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/dozen-eggs.png"
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Dozen eggs</p>
                    <p className="mt-0.5 font-receipt text-xs text-[var(--muted)]">
                      $6.00 each
                    </p>
                  </div>
                  <p className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--wash)] px-2.5 py-1 font-receipt text-sm font-semibold">
                    ×2
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2">
                  <p className="text-xs text-[var(--muted)]">Total</p>
                  <p className="font-receipt text-lg font-semibold text-[var(--field)]">
                    $12.00
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  2. Pay cash
                </p>
                <p className="mt-2 text-center text-[11px] leading-snug text-[var(--muted)]">
                  Slot, cash box, or whatever is provided
                </p>
                <p className="mt-1 text-center font-receipt text-2xl font-semibold text-[var(--field)]">
                  $12.00
                </p>
                <p className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] py-2.5 text-center text-[11px] font-semibold text-white">
                  I have paid cash ✓
                </p>
                <p className="mt-1.5 text-center text-[10px] font-medium text-[var(--field)]">
                  Confirmed - owner alerted
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="shrink-0 self-center font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink-on-dark)]/45 2xl:text-3xl"
        >
          =
        </p>

        <div className="mx-auto shrink-0 2xl:mx-0">
          <HeroOwnerPhoneAlert />
        </div>
      </div>
    </div>
  );
}
