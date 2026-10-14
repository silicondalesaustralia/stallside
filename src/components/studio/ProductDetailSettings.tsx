"use client";

import type { CraftProductDetailProps } from "@/components/studio/sections/CraftProductDetailSection";
import { PRODUCT_IMAGE_RATIOS, PRODUCT_LAYOUTS, productDetailView } from "@/lib/studio/product-detail-settings";
import SiteChoice from "./SiteChoice";
import ProductInfoRowsEditor from "./ProductInfoRowsEditor";
import ProductTabsEditor from "./ProductTabsEditor";

const LAYOUTS = { classic: "Classic", gallery: "Gallery", simple: "Simple" } as const;
const LAYOUT_HINTS = {
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
      <Toggle label="Sticky Add to cart bar on phones" checked={view.stickyCart} onChange={(v) => setProp("stickyCart", v)} />
      <Toggle label="Show back to shop link" checked={props.showBackLink} onChange={(v) => setProp("showBackLink", v)} />
      <Toggle label="Show product reviews under detail" checked={props.showReviews} onChange={(v) => setProp("showReviews", v)} />
      <ProductInfoRowsEditor value={props.infoRows} onChange={(rows) => setProp("infoRows", rows)} />
      <ProductTabsEditor value={props.tabs} onChange={(tabs) => setProp("tabs", tabs)} />
    </>
  );
}
