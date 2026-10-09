import Image from "next/image";
import Link from "next/link";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { shopPagePath } from "@/lib/storefront/paths";

type HeroProps = {
  headline: string;
  supportingText: string;
  layout: "simple" | "split" | "spotlight" | "background";
  ctaLabel: string;
  showCta: boolean;
};

export default function PuckHeroBlock({
  headline,
  supportingText,
  showCta,
  ctaLabel,
  puck,
}: HeroProps & { puck: { metadata: PuckSpikeMetadata } }) {
  const meta = puck.metadata;
  const title = headline.trim() || meta.branding.headline;
  const subtitle = supportingText.trim() || meta.branding.subheadline || "";
  const heroImage = meta.branding.heroImageUrl;

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--panel)]">
      {heroImage ? (
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[var(--wash)]" />
        </div>
      ) : null}
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--field)] sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
              {subtitle}
            </p>
          ) : null}
          {meta.branding.regionLabel ? (
            <p className="mt-2 text-sm font-medium text-[var(--leaf-dark)]">
              {meta.branding.regionLabel}
            </p>
          ) : null}
          {showCta && meta.products.length > 0 ? (
            <Link
              href={shopPagePath(
                meta.storefrontSlug,
                "shop",
                meta.draft,
                meta.basePath,
              )}
              className="mt-8 inline-flex rounded-full bg-[var(--leaf-dark)] px-6 py-3 text-sm font-semibold text-white"
            >
              {ctaLabel || "Shop now"}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
