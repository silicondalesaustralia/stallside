"use client";

import SectionCopy from "@/components/studio/SectionCopy";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Current menu": the seller's current menu title and description lead. */
export default function HeroMenu({ view }: { view: HeroView }) {
  const menu = view.meta.menus[0];
  const centre = view.look.align === "centre";
  const description = menu?.description || view.subtitle;
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div className={`mx-auto max-w-[var(--studio-content-max)] py-10 studio-gutter studio-gutter--wide sf-sm:py-12 ${centre ? "text-center" : ""}`}>
        <SectionCopy k="menuEyebrow" fallback="Current menu" as="p" className="studio-eyebrow text-[var(--leaf-dark)]" />
        <HeroTitle
          view={view}
          display={menu?.title ?? view.title}
          placeholder={menu?.title || view.brandHeadline}
          className="studio-display mt-2 text-3xl text-[var(--field)] sf-sm:text-4xl"
        />
        {view.editable ? (
          <HeroSubtitle view={view} className={`mt-3 max-w-2xl text-[var(--muted)] ${centre ? "mx-auto" : ""}`} />
        ) : description ? (
          <p className={`mt-3 max-w-2xl text-[var(--muted)] ${centre ? "mx-auto" : ""}`}>{description}</p>
        ) : null}
        {view.buttons ? (
          <div className={`mt-6 flex flex-wrap gap-3 ${centre ? "justify-center" : ""}`}>{view.buttons}</div>
        ) : null}
      </div>
    </section>
  );
}
