import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import { shopPagePath } from "@/lib/storefront/paths";
import { STOREFRONT_THEMES } from "@/lib/storefront/themes";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

export default function StorefrontHero({
  branding,
  storefrontSlug,
  draft,
  hasProducts,
}: {
  branding: ResolvedStorefrontBranding;
  storefrontSlug: string;
  draft?: boolean;
  hasProducts: boolean;
}) {
  const theme = STOREFRONT_THEMES[branding.themePreset];
  const btnClass = storefrontButtonClass(branding);

  const heroContent = (
    <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        {!branding.logoUrl && theme.heroStyle !== "minimal" ? (
          <div className="mb-6 flex justify-center">
            <BrandMark className="size-16 opacity-90" />
          </div>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--field)] sm:text-5xl">
          {branding.headline}
        </h1>
        {branding.subheadline ? (
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            {branding.subheadline}
          </p>
        ) : null}
        {branding.regionLabel ? (
          <p className="mt-2 text-sm font-medium text-[var(--leaf-dark)]">
            {branding.regionLabel}
          </p>
        ) : null}
        {hasProducts ? (
          <Link
            href={shopPagePath(storefrontSlug, "shop", draft)}
            className={`mt-8 inline-flex ${btnClass}`}
          >
            Shop now
          </Link>
        ) : null}
      </div>
    </div>
  );

  if (branding.heroImageUrl && theme.heroStyle !== "minimal") {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={branding.heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[var(--wash)]" />
        </div>
        <div className="relative">{heroContent}</div>
      </section>
    );
  }

  if (theme.heroStyle === "gradient") {
    return (
      <section className="bg-gradient-to-br from-[var(--wash)] via-white to-[var(--leaf)]/10">
        {heroContent}
      </section>
    );
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--panel)]">
      {heroContent}
    </section>
  );
}
