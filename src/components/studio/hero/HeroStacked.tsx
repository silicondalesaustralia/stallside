"use client";

import Image from "next/image";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Photo above text": a large photo with the text underneath, readable at every screen size. */
export default function HeroStacked({ view }: { view: HeroView }) {
  const region = view.meta.branding.regionLabel;
  const left = view.look.align === "left";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--panel)]`} style={view.style}>
      <div className="mx-auto max-w-[var(--studio-content-max)] py-10 studio-gutter studio-gutter--wide sf-sm:py-14">
        <div className="studio-section-image relative aspect-[16/9] overflow-hidden rounded-[var(--studio-card-radius)]">
          <Image src={view.heroImage ?? ""} alt="" fill className="sf-photo" sizes="100vw" priority />
        </div>
        <div className={`mt-10 ${left ? "" : "mx-auto max-w-[var(--studio-prose-max)] text-center"}`}>
          {region ? <p className="studio-eyebrow text-[var(--leaf-dark)]">{region}</p> : null}
          <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
          <HeroSubtitle view={view} className={`mt-4 text-lg leading-relaxed text-[var(--muted)] ${left ? "max-w-2xl" : ""}`} />
          {view.buttons ? (
            <div className={`mt-8 flex flex-wrap gap-3 ${left ? "" : "justify-center"}`}>{view.buttons}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
