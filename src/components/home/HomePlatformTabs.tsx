"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { HOME_H3, HOME_PLAN_TAG, HOME_SCREEN_CAPTION, HOME_TEXT_LINK } from "@/components/home/home-styles";
import { HOME_TABS } from "@/lib/home-page-copy";

const NEXT_KEYS: Record<string, (i: number, n: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_i, n) => n - 1,
};

/** `previews` are server-rendered, one per entry in HOME_TABS. */
export default function HomePlatformTabs({ previews }: { previews: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = HOME_TABS[active];

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const next = NEXT_KEYS[e.key];
    if (!next) return;
    e.preventDefault();
    const n = next(i, HOME_TABS.length);
    setActive(n);
    tabRefs.current[n]?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label="Explore Vendl" className="flex justify-between gap-4 border-b border-[var(--line)] sm:justify-start sm:gap-8">
        {HOME_TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`home-tab-${t.id}`}
            aria-controls="home-tab-panel"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`cursor-pointer border-b-[3px] py-3.5 text-[11px] font-semibold sm:py-[18px] sm:text-sm ${
              i === active ? "border-[var(--field)] text-[var(--field)]" : "border-transparent text-[var(--muted)]"
            }`}
          >
            {String(i + 1).padStart(2, "0")}&nbsp;&nbsp; {t.label}
          </button>
        ))}
      </div>
      <div
        id="home-tab-panel"
        role="tabpanel"
        aria-labelledby={`home-tab-${tab.id}`}
        className="grid min-h-[370px] gap-6 overflow-hidden bg-[#edf0e7] p-6 md:grid-cols-[1fr_1.9fr] md:gap-8 md:py-10 md:pl-9 md:pr-0"
      >
        <div className="self-center">
          <span className={HOME_PLAN_TAG}>{tab.plan}</span>
          <h3 className={`${HOME_H3} mb-4 mt-3.5 text-[28px] lg:text-[34px]`}>{tab.title}</h3>
          <p className="mb-6 text-sm text-[var(--muted)] md:max-w-[280px]">{tab.copy}</p>
          <Link href="/signup" className={HOME_TEXT_LINK}>
            Make yourself at home →
          </Link>
        </div>
        <div className="min-w-0 self-center md:pr-9">
          {previews[active]}
          <span className={HOME_SCREEN_CAPTION}>{tab.caption}</span>
        </div>
      </div>
    </>
  );
}
