"use client";

import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import HeroOpenBadge from "./HeroOpenBadge";
import type { HeroView } from "./types";

/** "Opening status": headline with a live open/closed badge. */
export default function HeroStandStatus({ view }: { view: HeroView }) {
  const centre = view.look.align === "centre";
  const region = view.meta.branding.regionLabel;
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div className={`mx-auto max-w-[var(--studio-content-max)] py-12 studio-gutter studio-gutter--wide sf-sm:py-16 ${centre ? "text-center" : ""}`}>
        {region ? <p className="studio-eyebrow text-[var(--site-accent,#a0522d)]">{region}</p> : null}
        <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
        <HeroSubtitle view={view} className={`mt-4 max-w-2xl text-lg text-[var(--muted)] ${centre ? "mx-auto" : ""}`} />
        <div className={`mt-6 flex flex-wrap items-center gap-3 ${centre ? "justify-center" : ""}`}>
          <HeroOpenBadge meta={view.meta} />
          {view.buttons}
        </div>
      </div>
    </section>
  );
}
