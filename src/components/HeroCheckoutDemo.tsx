"use client";

import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import HeroOwnerPhoneAlert from "@/components/HeroOwnerPhoneAlert";
import {
  HeroCardPayPanel,
  HeroCashPayPanel,
  HeroPickPanel,
} from "@/components/HeroCheckoutPanels";

type PayMode = "cash" | "card";

/** Customer checkout → owner sale alert. Pay panel rotates cash ↔ card. */
export default function HeroCheckoutDemo() {
  const [mode, setMode] = useState<PayMode>("cash");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setMode((prev) => (prev === "cash" ? "card" : "cash"));
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hero-phone relative w-full max-w-none">
      <div
        aria-hidden
        className="hero-bracket absolute -bottom-2 -right-2 size-12 border-b-[3px] border-r-[3px] border-[var(--ink-on-dark)]/45 sm:size-14"
        style={{ borderBottomRightRadius: 10 }}
      />
      <div className="flex flex-col items-stretch gap-3 xl:flex-row xl:items-center xl:gap-3">
        <div className="@container w-full min-w-0 overflow-hidden rounded-[20px] border-[4px] border-[var(--ink-on-dark)]/90 bg-[var(--panel)] shadow-[0_20px_50px_rgb(0_0_0/0.4)] xl:min-w-0 xl:flex-1">
          <div className="bg-[var(--wash)] px-3 py-3 text-[var(--ink)] sm:px-4 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <BrandMark className="size-5 shrink-0 sm:size-6" link={false} />
                <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight sm:text-base">
                  Green Valley Eggs
                </p>
              </div>
              <p className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Customer
              </p>
            </div>

            <div className="mt-2.5 grid gap-2.5 @[18rem]:grid-cols-2 sm:mt-3 sm:gap-3">
              <HeroPickPanel />
              <div className="grid">
                <div
                  className={`col-start-1 row-start-1 transition-opacity duration-500 ease-out ${
                    mode === "cash"
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                >
                  <HeroCashPayPanel />
                </div>
                <div
                  className={`col-start-1 row-start-1 transition-opacity duration-500 ease-out ${
                    mode === "card"
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={mode !== "card"}
                >
                  <HeroCardPayPanel />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="shrink-0 self-center font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink-on-dark)]/45 xl:text-2xl"
        >
          =
        </p>

        <div className="mx-auto shrink-0 xl:mx-0">
          <HeroOwnerPhoneAlert />
        </div>
      </div>
    </div>
  );
}
