"use client";

import type { CraftProductDetailProps } from "@/components/studio/sections/CraftProductDetailSection";
import {
  IMAGE_SIZE_MAX,
  IMAGE_SIZE_MIN,
  PRODUCT_IMAGE_RATIOS,
  PRODUCT_LAYOUTS,
  productDetailView,
} from "@/lib/studio/product-detail-settings";
import SiteChoice from "./SiteChoice";
import ProductInfoRowsEditor from "./ProductInfoRowsEditor";
import ProductTabsEditor from "./ProductTabsEditor";
import ProductBlockLayoutEditor from "./ProductBlockLayoutEditor";
import CartBarSettings from "./CartBarSettings";
import ProductButtonSettings from "./ProductButtonSettings";

const LAYOUTS = { featured: "Featured", classic: "Classic", gallery: "Gallery", simple: "Simple" } as const;
const LAYOUT_HINTS = {
  featured: "Large main photo with thumbnails under it; tap a thumbnail to show it. Drag to set the photo size.",
  classic: "Main photo with thumbnails, details beside it.",
  gallery: "All photos stacked; details stay in view while scrolling.",
  simple: "One column: photo, details, then extra photos in a grid.",
} as const;
const RATIOS = { square: "Square", portrait: "Tall (4:5)", landscape: "Wide (4:3)" } as const;
const SIDES = { left: "Photos left", right: "Photos right" } as const;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** Product page section: layout, photo options, info lines and tabs. Applies to every product. */
export default function ProductDetailSettings({
  props,
  setProp,
}: {
  props: CraftProductDetailProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const view = productDetailView(props);
  return (
    <>
      <p className="text-xs text-[var(--muted)]">These settings apply to every product page. Add more photos on each product&apos;s edit page.</p>
      <SiteChoice label="Layout" options={PRODUCT_LAYOUTS} labels={LAYOUTS} value={view.layout} onChange={(v) => setProp("layout", v)} />
      <p className="text-xs text-[var(--muted)]">{LAYOUT_HINTS[view.layout]}</p>
      {view.layout === "featured" ? (
        <div className="space-y-1.5">
          <label htmlFor="product-image-size" className="flex justify-between text-xs font-semibold text-[var(--field)]">
            Main photo size <span className="font-normal text-[var(--muted)]">{view.imageSize}% of the width</span>
          </label>
          <input
            id="product-image-size"
            type="range"
            min={IMAGE_SIZE_MIN}
            max={IMAGE_SIZE_MAX}
            step={1}
            value={view.imageSize}
            onChange={(e) => setProp("imageSize", Number(e.target.value))}
            className="w-full accent-[var(--leaf)]"
          />
          <p className="text-xs text-[var(--muted)]">Wider screens only; on phones the photo is full width.</p>
        </div>
      ) : null}
      <SiteChoice label="Photo shape" options={PRODUCT_IMAGE_RATIOS} labels={RATIOS} value={view.imageRatio} onChange={(v) => setProp("imageRatio", v)} />
      {view.layout !== "simple" ? (
        <SiteChoice
          label="Photo position (wider screens)"
          options={["left", "right"] as const}
          labels={SIDES}
          value={view.imageOnRight ? "right" : "left"}
          onChange={(v) => setProp("imageSide", v)}
        />
      ) : null}
      <Toggle label="Click photos to enlarge" checked={view.enlarge} onChange={(v) => setProp("enlarge", v)} />
      <ProductButtonSettings buttons={view.buttons} width={view.buttonWidth} texts={props.texts} setProp={setProp} />
      <Toggle label="Sticky Add to cart bar on phones (product pages)" checked={view.stickyCart} onChange={(v) => setProp("stickyCart", v)} />
      <CartBarSettings />
      <Toggle label="Show payment options under the buttons" checked={view.showPayments} onChange={(v) => setProp("showPayments", v)} />
      <Toggle label="Show breadcrumbs" checked={props.showBreadcrumbs !== false} onChange={(v) => setProp("showBreadcrumbs", v)} />
      <Toggle label="Show back to shop link" checked={props.showBackLink !== false} onChange={(v) => setProp("showBackLink", v)} />
      <Toggle label="Show review stars & rating" checked={view.showRating} onChange={(v) => setProp("showRating", v)} />
      <Toggle label="Show product reviews" checked={props.showReviews} onChange={(v) => setProp("showReviews", v)} />
      {props.showReviews ? (
        <Toggle label="Let customers leave a review" checked={props.showReviewForm !== false} onChange={(v) => setProp("showReviewForm", v)} />
      ) : null}
      <ProductBlockLayoutEditor layout={view.blocks} onChange={(next) => setProp("blockLayout", next)} />
      <ProductInfoRowsEditor value={props.infoRows} onChange={(rows) => setProp("infoRows", rows)} />
      <ProductTabsEditor value={props.tabs} onChange={(tabs) => setProp("tabs", tabs)} />
    </>
  );
}
