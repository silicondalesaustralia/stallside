"use client";

import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";
import type { HeroPreset } from "@/lib/studio/preset-registry";
import { resolveHeroStyle } from "@/lib/studio/hero-styles";
import { heroHeightStyle, parseHeroLook } from "@/lib/studio/hero-look";
import HeroButtons, { heroHasButtons } from "@/components/studio/hero/HeroButtons";
import HeroBand from "@/components/studio/hero/HeroBand";
import HeroMenu from "@/components/studio/hero/HeroMenu";
import HeroCollage from "@/components/studio/hero/HeroCollage";
import HeroMosaic from "@/components/studio/hero/HeroMosaic";
import HeroFeaturedProduct from "@/components/studio/hero/HeroFeaturedProduct";
import HeroVisitUs from "@/components/studio/hero/HeroVisitUs";
import HeroCountdown, { countdownMenu } from "@/components/studio/hero/HeroCountdown";
import HeroStandStatus from "@/components/studio/hero/HeroStandStatus";
import HeroOverlay from "@/components/studio/hero/HeroOverlay";
import HeroSplit from "@/components/studio/hero/HeroSplit";
import HeroCentred from "@/components/studio/hero/HeroCentred";
import HeroStacked from "@/components/studio/hero/HeroStacked";
import type { HeroView } from "@/components/studio/hero/types";

type Props = {
  headline: string;
  supportingText: string;
  layout: HeroPreset | "spotlight";
  ctaLabel: string;
  showCta: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
  /** Optional section-level image (e.g. AI decorative placeholder). */
  backgroundImageUrl?: string | null;
  /** Look settings (height, alignment, fade, image side, second button). */
  look?: Record<string, unknown>;
};

export default function StudioHeroBlock({
  headline,
  supportingText,
  layout,
  ctaLabel,
  showCta,
  metadata: meta,
  backgroundImageUrl,
  editable = false,
  look: rawLook,
}: Props) {
  const variant = resolveHeroStyle(meta.templateId, layout);
  const look = parseHeroLook(rawLook ?? {});
  const heroImage = backgroundImageUrl || meta.branding.heroImageUrl;
  const showPrimary = showCta && meta.products.length > 0;
  const view: HeroView = {
    meta,
    editable,
    headline,
    supportingText,
    ctaLabel,
    showCta,
    title: headline.trim() || meta.branding.headline,
    subtitle: supportingText.trim() || meta.branding.subheadline || "",
    brandHeadline: meta.branding.headline || "Add a headline",
    heroImage,
    look,
    buttons: heroHasButtons(showPrimary, look, meta) ? (
      <HeroButtons
        meta={meta}
        editable={editable}
        showPrimary={showPrimary}
        label={ctaLabel}
        defaultLabel={meta.templateId === "market" ? "Shop now" : "Browse"}
        defaultHref={shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath)}
        look={look}
      />
    ) : null,
    sectionClass: `studio-hero studio-hero--${variant}`,
    style: heroHeightStyle(look),
  };

  if (variant === "shop-first" || variant === "promo") return <HeroBand view={view} promo={variant === "promo"} />;
  if (variant === "current-menu") return <HeroMenu view={view} />;
  if (variant === "product-collage" && meta.products.length > 0) return <HeroCollage view={view} />;
  if (variant === "category-mosaic" && meta.categories.length >= 2) return <HeroMosaic view={view} />;
  if (variant === "featured-product" && meta.products.length > 0) return <HeroFeaturedProduct view={view} />;
  if (variant === "visit-us") return <HeroVisitUs view={view} />;
  if (variant === "countdown" && countdownMenu(meta)) return <HeroCountdown view={view} />;
  if (variant === "stand-status") return <HeroStandStatus view={view} />;
  if ((variant === "background" || variant === "farm-landscape") && heroImage) {
    return <HeroOverlay view={view} farm={variant === "farm-landscape"} />;
  }
  if (variant === "split" || variant === "produce-split") return <HeroSplit view={view} />;
  if (variant === "minimal" || !heroImage) return <HeroCentred view={view} />;
  return <HeroStacked view={view} />;
}
