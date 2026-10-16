"use client";

import Image from "next/image";
import SectionCopy from "@/components/studio/SectionCopy";
import { hoursLines } from "@/lib/studio/open-status";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import HeroOpenBadge from "./HeroOpenBadge";
import type { HeroView } from "./types";

const LABEL = "text-xs font-bold uppercase tracking-wide text-[var(--muted)]";

/** "Visit us": live open status, opening hours and directions beside the headline. */
export default function HeroVisitUs({ view }: { view: HeroView }) {
  const { meta } = view;
  const lines = hoursLines(meta.standHours?.hours);
  const place = meta.locality || meta.branding.regionLabel;
  const card = (
    <div className="rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow-card)]">
      {meta.standHours ? <HeroOpenBadge meta={meta} /> : null}
      {lines.length > 0 ? (
        <>
          <SectionCopy k="hoursLabel" fallback="Opening hours" as="p" className={`${LABEL} mt-4`} />
          <ul className="mt-2 space-y-1 text-sm text-[var(--field)]">
            {lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </>
      ) : null}
      {place ? (
        <>
          <SectionCopy k="findUsLabel" fallback="Find us" as="p" className={`${LABEL} mt-4`} />
          <p className="mt-1 font-semibold text-[var(--field)]">{place}</p>
        </>
      ) : null}
      {meta.directionsUrl ? (
        <a href={meta.directionsUrl} target="_blank" rel="noopener noreferrer" className="studio-btn studio-btn--secondary mt-4">
          <SectionCopy k="directions" fallback="Get directions" />
        </a>
      ) : null}
    </div>
  );
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div className="mx-auto grid max-w-[var(--studio-content-max)] items-center gap-8 py-12 studio-gutter studio-gutter--wide sf-sm:py-16 sf-lg:grid-cols-2">
        <div>
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
          ) : null}
          <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
          <HeroSubtitle view={view} className="mt-4 text-lg leading-relaxed text-[var(--muted)]" />
          {view.buttons ? <div className="mt-8 flex flex-wrap gap-3">{view.buttons}</div> : null}
        </div>
        {view.heroImage ? (
          <div className="studio-section-image relative min-h-[22rem] overflow-hidden rounded-[var(--studio-card-radius)]">
            <Image src={view.heroImage} alt="" fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
            <div className="absolute inset-x-4 bottom-4 sf-sm:left-auto sf-sm:w-72">{card}</div>
          </div>
        ) : (
          card
        )}
      </div>
    </section>
  );
}
