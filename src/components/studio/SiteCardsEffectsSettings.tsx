"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";
import { BUTTON_SHAPES, CARD_HOVERS, PRODUCT_RATIOS, SITE_BUTTON_SIZES } from "@/lib/storefront/site-style";
import SiteChoice from "./SiteChoice";
import SiteStyleSelect from "./SiteStyleSelect";

const SHAPES = { square: "Square", rounded: "Rounded", pill: "Pill" } as const;
const SIZES = { sm: "Small", md: "Medium", lg: "Large" } as const;
const RATIOS = { square: "Square", portrait: "Tall (4:5)", landscape: "Wide (4:3)" } as const;
const HOVERS = { none: "None", lift: "Lift", zoom: "Zoom image" } as const;
const ANIMATIONS = { none: "Off", fade: "Fade in on scroll" } as const;

/** Site-wide button shape and size, product card style and scroll animation. */
export default function SiteCardsEffectsSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Buttons, cards &amp; effects</p>
      <div className="grid grid-cols-2 gap-2">
        <SiteStyleSelect id="site-btn-shape" label="Button shape" options={BUTTON_SHAPES} labels={SHAPES} value={siteStyle.buttonShape} onChange={(v) => set("buttonShape", v)} defaultLabel="Template default" />
        <SiteStyleSelect id="site-btn-size" label="Button size" options={SITE_BUTTON_SIZES} labels={SIZES} value={siteStyle.buttonSize} onChange={(v) => set("buttonSize", v)} defaultLabel="Template default" />
        <SiteStyleSelect id="site-product-ratio" label="Product image shape" options={PRODUCT_RATIOS} labels={RATIOS} value={siteStyle.productRatio} onChange={(v) => set("productRatio", v)} defaultLabel="Template default" />
        <SiteStyleSelect id="site-card-hover" label="Card hover" options={CARD_HOVERS} labels={HOVERS} value={siteStyle.cardHover} onChange={(v) => set("cardHover", v)} defaultLabel="Template default" />
      </div>
      <SiteChoice
        label="Section animation"
        options={["none", "fade"] as const}
        labels={ANIMATIONS}
        value={siteStyle.animation ?? "none"}
        onChange={(v) => set("animation", v === "none" ? undefined : v)}
      />
      <p className="text-xs text-[var(--muted)]">Animations show on your live site only, and are skipped for visitors who turn off motion.</p>
    </div>
  );
}
