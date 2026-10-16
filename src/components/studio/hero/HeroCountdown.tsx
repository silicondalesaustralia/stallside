"use client";

import SectionCopy from "@/components/studio/SectionCopy";
import { shopMenuPath } from "@/lib/storefront/paths";
import type { StudioMetadata } from "@/lib/studio/types";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import HeroButtons from "./HeroButtons";
import CountdownClock from "./CountdownClock";
import type { HeroView } from "./types";

/** The next pre-order drop that still has a closing time. */
export function countdownMenu(meta: StudioMetadata): StudioMetadata["menus"][number] | null {
  return meta.menus.find((m) => m.isPreOrderDrop && m.orderByAt) ?? null;
}

/** "Next drop countdown": time left to pre-order, with the button going to the drop. */
export default function HeroCountdown({ view }: { view: HeroView }) {
  const { meta } = view;
  const menu = countdownMenu(meta);
  if (!menu?.orderByAt) return null;
  const centre = view.look.align === "centre";
  const label = view.ctaLabel && view.ctaLabel !== "Shop now" ? view.ctaLabel : "";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--wash)]`} style={view.style}>
      <div className={`mx-auto max-w-[var(--studio-content-max)] py-12 studio-gutter studio-gutter--wide sf-sm:py-16 ${centre ? "text-center" : ""}`}>
        <SectionCopy k="countdownEyebrow" fallback="Pre-orders close in" as="p" className="studio-eyebrow text-[var(--leaf-dark)]" />
        <div className={`mt-3 flex ${centre ? "justify-center" : ""}`}>
          <CountdownClock endsAt={menu.orderByAt} fallback={menu.orderByLabel ? `Orders close ${menu.orderByLabel}` : menu.title} />
        </div>
        <HeroTitle
          view={view}
          display={view.headline.trim() || menu.title}
          placeholder={menu.title}
          className="studio-display mt-6 text-4xl text-[var(--field)] sf-sm:text-5xl"
        />
        {view.editable || view.subtitle ? (
          <HeroSubtitle view={view} className={`mt-4 max-w-2xl text-lg text-[var(--muted)] ${centre ? "mx-auto" : ""}`} />
        ) : menu.description ? (
          <p className={`mt-4 max-w-2xl text-lg text-[var(--muted)] ${centre ? "mx-auto" : ""}`}>{menu.description}</p>
        ) : null}
        {menu.collectionLabel ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            <SectionCopy k="collectLine" fallback="Collect {date}" vars={{ date: menu.collectionLabel }} />
          </p>
        ) : null}
        <div className={`mt-8 flex flex-wrap gap-3 ${centre ? "justify-center" : ""}`}>
          <HeroButtons
            meta={meta}
            editable={view.editable}
            showPrimary={view.showCta}
            label={label}
            defaultLabel="Pre-order now"
            defaultHref={shopMenuPath(meta.storefrontSlug, menu.slug, meta.draft, meta.basePath, true)}
            look={view.look}
          />
        </div>
      </div>
    </section>
  );
}
