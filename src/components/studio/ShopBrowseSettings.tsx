"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";

/** Site-wide switches for the sort menu and filter sidebar on shop and category pages. */
export default function ShopBrowseSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);
  return (
    <div className="mt-6 space-y-2 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Shop sorting &amp; filters</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={siteStyle.shopSort !== false} onChange={(e) => set("shopSort", e.target.checked ? undefined : false)} />
        Show sort menu
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={siteStyle.shopFilters !== false} onChange={(e) => set("shopFilters", e.target.checked ? undefined : false)} />
        Show filter sidebar
      </label>
      <p className="text-xs text-[var(--muted)]">
        On your shop and category pages. Shoppers can sort by featured, newest, price, on sale and rating, and filter
        by category, price, stock, sale and rating. Filters with nothing to choose are hidden.
      </p>
    </div>
  );
}
