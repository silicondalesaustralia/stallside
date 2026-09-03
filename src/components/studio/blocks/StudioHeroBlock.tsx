import Link from "next/link";
import Image from "next/image";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";
import type { HeroPreset } from "@/lib/studio/preset-registry";

type Props = {
  headline: string;
  supportingText: string;
  layout: HeroPreset | "simple" | "split" | "spotlight" | "background" | "editorial" | "minimal";
  ctaLabel: string;
  showCta: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
};

type ResolvedVariant =
  | "editorial"
  | "split"
  | "background"
  | "minimal"
  | "farm-landscape"
  | "stand-status"
  | "produce-split"
  | "shop-first"
  | "current-menu"
  | "product-collage"
  | "promo";

function resolveVariant(templateId: StudioMetadata["templateId"], layout: Props["layout"]): ResolvedVariant {
  if (layout === "farm-landscape" || layout === "stand-status" || layout === "produce-split") return layout;
  if (layout === "shop-first" || layout === "current-menu" || layout === "product-collage" || layout === "promo") {
    return layout;
  }
  if (layout === "simple" || layout === "spotlight") {
    return templateId === "market" ? "shop-first" : templateId === "farmhouse" ? "stand-status" : "editorial";
  }
  if (layout === "split" || layout === "background" || layout === "minimal" || layout === "editorial") {
    return layout;
  }
  if (templateId === "farmhouse") return "farm-landscape";
  if (templateId === "market") return "shop-first";
  return "background";
}

export default function StudioHeroBlock({
  headline,
  supportingText,
  layout,
  ctaLabel,
  showCta,
  metadata: meta,
}: Props) {
  const variant = resolveVariant(meta.templateId, layout);
  const title = headline.trim() || meta.branding.headline;
  const subtitle = supportingText.trim() || meta.branding.subheadline || "";
  const heroImage = meta.branding.heroImageUrl;
  const shopHref = shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath);
  const showButton = showCta && meta.products.length > 0;
  const templateClass = `studio-hero--${variant}`;

  const cta = showButton ? (
    <Link href={shopHref} className="studio-btn studio-btn--primary">
      {ctaLabel || (meta.templateId === "market" ? "Shop now" : "Browse")}
    </Link>
  ) : null;

  if (variant === "shop-first" || variant === "promo") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto flex max-w-[var(--studio-content-max)] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-12">
          <div className="max-w-xl">
            {variant === "promo" ? (
              <p className="studio-eyebrow text-[var(--leaf-dark)]">This week</p>
            ) : null}
            <h1 className="studio-display text-3xl text-[var(--field)] sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">{subtitle}</p> : null}
          </div>
          {cta ? <div className="shrink-0">{cta}</div> : null}
        </div>
      </section>
    );
  }

  if (variant === "current-menu") {
    const menu = meta.menus[0];
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-10 sm:px-8 sm:py-12">
          <p className="studio-eyebrow text-[var(--leaf-dark)]">Current menu</p>
          <h1 className="studio-display mt-2 text-3xl text-[var(--field)] sm:text-4xl">
            {menu?.title ?? title}
          </h1>
          {menu?.description ? (
            <p className="mt-3 max-w-2xl text-[var(--muted)]">{menu.description}</p>
          ) : subtitle ? (
            <p className="mt-3 max-w-2xl text-[var(--muted)]">{subtitle}</p>
          ) : null}
          {cta ? <div className="mt-6">{cta}</div> : null}
        </div>
      </section>
    );
  }

  if (variant === "product-collage" && meta.products.length > 0) {
    const collage = meta.products.slice(0, 4);
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto grid max-w-[var(--studio-content-max)] gap-8 px-4 py-10 lg:grid-cols-2 lg:items-center sm:px-8">
          <div>
            <h1 className="studio-display text-3xl text-[var(--field)] sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 text-[var(--muted)]">{subtitle}</p> : null}
            {cta ? <div className="mt-6">{cta}</div> : null}
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {collage.map((p) => (
              <li key={p.id} className="relative aspect-square overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="25vw" />
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

  if (variant === "stand-status") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-12 sm:px-8 sm:py-16">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--site-accent,#a0522d)]">{meta.branding.regionLabel}</p>
          ) : null}
          <h1 className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">{subtitle}</p> : null}
          <div className="mt-6 inline-flex flex-wrap gap-3">
            <span className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--field)]">
              Farm stand open
            </span>
            {cta ? cta : null}
          </div>
        </div>
      </section>
    );
  }

  if ((variant === "background" || variant === "farm-landscape") && heroImage) {
    return (
      <section className={`studio-hero ${templateClass} relative min-h-[var(--studio-hero-min-height-mobile)] overflow-hidden sm:min-h-[var(--studio-hero-min-height)]`}>
        <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className={`studio-hero__overlay absolute inset-0 ${
          variant === "farm-landscape"
            ? "bg-gradient-to-t from-[#1f2e1f]/75 via-[#1f2e1f]/40 to-transparent"
            : "bg-gradient-to-t from-black/70 via-black/45 to-black/25"
        }`} />
        <div className="relative mx-auto flex min-h-[inherit] max-w-[var(--studio-content-max)] items-end px-4 py-14 sm:px-8 sm:py-20">
          <div className="max-w-xl text-white">
            {meta.branding.regionLabel ? (
              <p className="studio-eyebrow mb-3 text-white/80">{meta.branding.regionLabel}</p>
            ) : null}
            <h1 className="studio-display text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
            {subtitle ? <p className="mt-4 text-lg leading-relaxed text-white/90 sm:text-xl">{subtitle}</p> : null}
            {cta ? <div className="mt-8">{cta}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "split" || variant === "produce-split") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto grid max-w-[var(--studio-content-max)] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
            {meta.branding.regionLabel ? (
              <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
            ) : null}
            <h1 className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">{subtitle}</p> : null}
            {cta ? <div className="mt-8">{cta}</div> : null}
          </div>
          <div className="relative aspect-[4/3] bg-[var(--wash)] lg:aspect-auto lg:min-h-[28rem]">
            {heroImage ? (
              <Image src={heroImage} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
                Add a hero image in branding settings
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal" || !heroImage) {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-prose-max)] px-4 py-16 text-center sm:px-6 sm:py-20">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
          ) : null}
          <h1 className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">{subtitle}</p> : null}
          {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
      <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-10 sm:px-8 sm:py-14">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--studio-card-radius)]">
          <Image src={heroImage} alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="mx-auto mt-10 max-w-[var(--studio-prose-max)] text-center">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
          ) : null}
          <h1 className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">{subtitle}</p> : null}
          {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
        </div>
      </div>
    </section>
  );
}
