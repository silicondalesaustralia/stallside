"use client";

import type { CraftCategoryDetailProps } from "@/components/studio/sections/CraftCategoryDetailSection";
import {
  CATEGORY_ALIGNS,
  categoryDetailView,
  type CategoryColumns,
  type CategoryMobileColumns,
} from "@/lib/studio/category-detail-settings";
import SiteChoice from "./SiteChoice";
import PresetStyleField from "./PresetStyleField";
import { PRODUCT_PRESETS } from "@/lib/studio/preset-registry";
import CartBarSettings from "./CartBarSettings";
import CardBackgroundField from "./CardBackgroundField";

const COLUMNS = ["2", "3", "4"] as const;
const MOBILE_COLUMNS = ["1", "2"] as const;
const ALIGNS = { left: "Left", centre: "Centred" } as const;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** Category page section: what shows and how the products are laid out. Applies to every category. */
export default function CategoryDetailSettings({
  props,
  setProp,
}: {
  props: CraftCategoryDetailProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const view = categoryDetailView(props);
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        These settings apply to every category page. Write each category&apos;s descriptions and pick its thumbnail on
        its page under Categories in the dashboard.
      </p>
      <Toggle label="Show category name" checked={view.showTitle} onChange={(v) => setProp("showTitle", v)} />
      <Toggle
        label="Show top description (under the name)"
        checked={view.showTopDescription}
        onChange={(v) => setProp("showTopDescription", v)}
      />
      <Toggle
        label="Show bottom description (under the products)"
        checked={view.showBottomDescription}
        onChange={(v) => setProp("showBottomDescription", v)}
      />
      <SiteChoice label="Name and descriptions" options={CATEGORY_ALIGNS} labels={ALIGNS} value={view.align} onChange={(v) => setProp("align", v)} />
      <SiteChoice
        label="Products per row (wider screens)"
        options={COLUMNS}
        labels={{ "2": "2", "3": "3", "4": "4" }}
        value={String(view.columns) as (typeof COLUMNS)[number]}
        onChange={(v) => setProp("columns", Number(v) as CategoryColumns)}
      />
      <SiteChoice
        label="Products per row (phones)"
        options={MOBILE_COLUMNS}
        labels={{ "1": "1", "2": "2" }}
        value={String(view.mobileColumns) as (typeof MOBILE_COLUMNS)[number]}
        onChange={(v) => setProp("mobileColumns", Number(v) as CategoryMobileColumns)}
      />
      <PresetStyleField presetsBySkin={PRODUCT_PRESETS} value={view.preset ?? undefined} onChange={(v) => setProp("preset", v)} />
      <CardBackgroundField value={view.cardBackground} onChange={(v) => setProp("cardBackground", v)} />
      <Toggle label="Show prices" checked={view.showPrice} onChange={(v) => setProp("showPrice", v)} />
      <Toggle label="Show availability" checked={view.showAvailability} onChange={(v) => setProp("showAvailability", v)} />
      <Toggle label="Show review stars" checked={view.showRatings} onChange={(v) => setProp("showRatings", v)} />
      <p className="text-xs text-[var(--muted)]">Turn sorting and filters on or off under Site Wide Edits.</p>
      <CartBarSettings />
      <p className="text-xs text-[var(--muted)]">Style the name and descriptions under Text elements below.</p>
    </>
  );
}
