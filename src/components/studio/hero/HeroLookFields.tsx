"use client";

import SiteChoice from "@/components/studio/SiteChoice";
import { HERO_ALIGNS, HERO_HEIGHTS, HERO_IMAGE_SIDES, HERO_OVERLAYS, type HeroLook } from "@/lib/studio/hero-look";
import type { ResolvedHeroStyle } from "@/lib/studio/hero-styles";

const PHOTO_ON_TOP = new Set<ResolvedHeroStyle>(["background", "farm-landscape"]);
const HAS_SIDE = new Set<ResolvedHeroStyle>(["split", "produce-split", "product-collage", "featured-product"]);
const HAS_HEIGHT = new Set<ResolvedHeroStyle>(["background", "farm-landscape", "split", "produce-split"]);
const HAS_ALIGN = new Set<ResolvedHeroStyle>([
  "background", "farm-landscape", "split", "produce-split", "editorial", "minimal", "shop-first", "promo",
  "current-menu", "stand-status", "category-mosaic", "countdown",
]);

/** Height, alignment, fade strength, photo side and phone layout; only the ones the style uses. */
export default function HeroLookFields({
  style,
  look,
  setProp,
}: {
  style: ResolvedHeroStyle;
  look: HeroLook;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      {HAS_HEIGHT.has(style) ? (
        <SiteChoice
          label="Height"
          options={HERO_HEIGHTS}
          labels={{ small: "Short", medium: "Standard", large: "Tall" }}
          value={look.height}
          onChange={(v) => setProp("height", v)}
        />
      ) : null}
      {HAS_ALIGN.has(style) ? (
        <SiteChoice
          label="Text alignment"
          options={HERO_ALIGNS}
          labels={{ auto: "Style default", left: "Left", centre: "Centre" }}
          value={look.align}
          onChange={(v) => setProp("align", v)}
        />
      ) : null}
      {HAS_SIDE.has(style) ? (
        <SiteChoice
          label="Photo side"
          options={HERO_IMAGE_SIDES}
          labels={{ right: "Right", left: "Left" }}
          value={look.imageSide}
          onChange={(v) => setProp("imageSide", v)}
        />
      ) : null}
      {PHOTO_ON_TOP.has(style) ? (
        <>
          <SiteChoice
            label="Fade behind text"
            options={HERO_OVERLAYS}
            labels={{ light: "Light", medium: "Medium", strong: "Strong" }}
            value={look.overlay}
            onChange={(v) => setProp("overlay", v)}
          />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={look.mobileTextBelow}
              onChange={(e) => setProp("mobileTextBelow", e.target.checked)}
            />
            <span>
              Text below the photo on phones
              <span className="block text-xs text-[var(--muted)]">Keeps the photo clear and the text easy to read on small screens.</span>
            </span>
          </label>
        </>
      ) : null}
    </>
  );
}
