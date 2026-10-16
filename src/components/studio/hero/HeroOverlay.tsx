"use client";

import Image from "next/image";
import { heroOverlayClass } from "@/lib/studio/hero-look";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/**
 * "Photo with text on top" and "Landscape photo". With "text below on phones" the photo stays
 * clean on small screens and the text sits underneath, where it is always readable.
 */
export default function HeroOverlay({ view, farm }: { view: HeroView; farm: boolean }) {
  const below = view.look.mobileTextBelow;
  const centre = view.look.align === "centre";
  const region = view.meta.branding.regionLabel;
  const ink = below ? "text-[var(--field)] sf-sm:text-white" : "text-white";
  const soft = below ? "text-[var(--muted)] sf-sm:text-white/90" : "text-white/90";
  const eyebrow = below ? "text-[var(--leaf-dark)] sf-sm:text-white/80" : "text-white/80";
  const minH = "sf-sm:min-h-[var(--studio-hero-min-height)]";
  return (
    <section
      className={`${view.sectionClass} relative overflow-hidden ${below ? `bg-[var(--panel)] ${minH}` : `min-h-[var(--studio-hero-min-height-mobile)] ${minH}`}`}
      style={view.style}
    >
      <div className={below ? "relative aspect-[4/3] sf-sm:absolute sf-sm:inset-0 sf-sm:aspect-auto" : "absolute inset-0"}>
        <Image src={view.heroImage ?? ""} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className={`studio-hero__overlay absolute inset-0 ${heroOverlayClass(view.look, farm)} ${below ? "hidden sf-sm:block" : ""}`} />
      </div>
      <div
        className={`relative mx-auto flex max-w-[var(--studio-content-max)] studio-gutter studio-gutter--wide sf-sm:min-h-[inherit] sf-sm:items-end sf-sm:py-20 ${below ? "py-8" : "min-h-[inherit] items-end py-14"} ${centre ? "justify-center text-center" : ""}`}
      >
        <div className={`max-w-xl ${ink}`}>
          {region ? <p className={`studio-eyebrow mb-3 ${eyebrow}`}>{region}</p> : null}
          <HeroTitle view={view} className="studio-display text-4xl sf-sm:text-5xl sf-lg:text-6xl" />
          <HeroSubtitle view={view} className={`mt-4 text-lg leading-relaxed sf-sm:text-xl ${soft}`} />
          {view.buttons ? (
            <div className={`mt-8 flex flex-wrap gap-3 ${centre ? "justify-center" : ""}`}>{view.buttons}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
