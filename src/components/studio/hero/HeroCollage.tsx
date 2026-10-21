"use client";

import Image from "next/image";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Product collage": text beside four product photos. */
export default function HeroCollage({ view }: { view: HeroView }) {
  const collage = view.meta.products.slice(0, 4);
  const imageFirst = view.look.imageSide === "left";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--panel)]`} style={view.style}>
      <div className="studio-split mx-auto grid max-w-[var(--studio-content-max)] gap-8 py-10 sf-lg:grid-cols-2 sf-lg:items-center studio-gutter studio-gutter--wide">
        <div className={imageFirst ? "sf-lg:order-2" : undefined}>
          <HeroTitle view={view} className="studio-display text-3xl text-[var(--field)] sf-sm:text-4xl" />
          <HeroSubtitle view={view} className="mt-3 text-[var(--muted)]" />
          {view.buttons ? <div className="mt-6 flex flex-wrap gap-3">{view.buttons}</div> : null}
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {collage.map((p) => (
            <li key={p.id} className="studio-section-image relative aspect-square overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)]">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.name} fill className="sf-photo" sizes="25vw" />
              ) : (
                <span className="flex h-full items-end p-3 text-sm font-medium text-[var(--muted)]">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
