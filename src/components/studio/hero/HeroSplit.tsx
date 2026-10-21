"use client";

import Image from "next/image";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";
import ImagePairStack from "@/components/studio/ImagePairStack";
import { showImagePair } from "@/lib/studio/image-pair";

/** "Text beside photo": text on one half, the photo on the other. */
export default function HeroSplit({ view }: { view: HeroView }) {
  const region = view.meta.branding.regionLabel;
  const imageFirst = view.look.imageSide === "left";
  const centre = view.look.align === "centre";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--panel)]`} style={view.style}>
      <div className="studio-split mx-auto grid max-w-[var(--studio-content-max)] sf-lg:grid-cols-2">
        <div
          className={`flex flex-col justify-center py-12 studio-gutter studio-gutter--wide sf-sm:py-16 sf-lg:py-20 ${imageFirst ? "sf-lg:order-2" : ""} ${centre ? "items-center text-center" : ""}`}
        >
          {region ? <p className="studio-eyebrow text-[var(--leaf-dark)]">{region}</p> : null}
          <HeroTitle view={view} className="studio-display mt-2 text-4xl text-[var(--field)] sf-sm:text-5xl" />
          <HeroSubtitle view={view} className="mt-4 text-lg leading-relaxed text-[var(--muted)]" />
          {view.buttons ? (
            <div className={`mt-8 flex flex-wrap gap-3 ${centre ? "justify-center" : ""}`}>{view.buttons}</div>
          ) : null}
        </div>
        {showImagePair(view.look.imageStyle, view.look.secondImageUrl, view.editable) ? (
          <div className="flex items-center justify-center px-6 py-10 sf-lg:px-10">
            <ImagePairStack primaryUrl={view.heroImage} secondaryUrl={view.look.secondImageUrl} priority />
          </div>
        ) : (
        <div className="studio-section-image studio-hero__split-image relative aspect-[4/3] overflow-hidden bg-[var(--wash)] sf-lg:aspect-auto sf-lg:min-h-[var(--studio-hero-split-min,28rem)]">
          {view.heroImage ? (
            <Image src={view.heroImage} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
              Add a hero image in branding settings
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
