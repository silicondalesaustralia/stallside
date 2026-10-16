"use client";

import SectionCopy from "@/components/studio/SectionCopy";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Shop first" and "Promo": a compact band with the buttons beside the text. */
export default function HeroBand({ view, promo }: { view: HeroView; promo: boolean }) {
  const centre = view.look.align === "centre";
  const row = centre
    ? "flex flex-col items-center gap-6 text-center"
    : "flex flex-col gap-6 sf-sm:flex-row sf-sm:items-center sf-sm:justify-between";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--panel)]`} style={view.style}>
      <div className={`mx-auto max-w-[var(--studio-content-max)] py-10 studio-gutter studio-gutter--wide sf-sm:py-12 ${row}`}>
        <div className="max-w-xl">
          {promo ? (
            <SectionCopy k="weekEyebrow" fallback="This week" as="p" className="studio-eyebrow text-[var(--leaf-dark)]" />
          ) : null}
          <HeroTitle view={view} className="studio-display text-3xl text-[var(--field)] sf-sm:text-4xl" />
          <HeroSubtitle view={view} className="mt-3 text-base text-[var(--muted)] sf-sm:text-lg" />
        </div>
        {view.buttons ? <div className="flex shrink-0 flex-wrap gap-3">{view.buttons}</div> : null}
      </div>
    </section>
  );
}
