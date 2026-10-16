"use client";

import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Text only": a centred headline on the soft background; also any photo style without a photo. */
export default function HeroCentred({ view }: { view: HeroView }) {
  const region = view.meta.branding.regionLabel;
  const left = view.look.align === "left";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div
        className={`mx-auto py-16 studio-gutter sf-sm:py-20 ${left ? "max-w-[var(--studio-content-max)] studio-gutter--wide" : "max-w-[var(--studio-prose-max)] text-center"}`}
      >
        {region ? <p className="studio-eyebrow text-[var(--leaf-dark)]">{region}</p> : null}
        <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
        <HeroSubtitle view={view} className={`mt-5 text-lg leading-relaxed text-[var(--muted)] ${left ? "max-w-2xl" : ""}`} />
        {view.buttons ? (
          <div className={`mt-8 flex flex-wrap gap-3 ${left ? "" : "justify-center"}`}>{view.buttons}</div>
        ) : null}
      </div>
    </section>
  );
}
