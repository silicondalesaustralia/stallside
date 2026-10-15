"use client";

import type { ShopPart } from "@/lib/storefront/site-style";
import { useStudioEditorChrome } from "./StudioEditorContext";

const PARTS: { id: ShopPart; label: string; filter: boolean }[] = [
  { id: "count", label: "Product count (\u201c12 products\u201d)", filter: false },
  { id: "category", label: "Category", filter: true },
  { id: "price", label: "Price slider", filter: true },
  { id: "stock", label: "Availability (in stock)", filter: true },
  { id: "sale", label: "On sale", filter: true },
  { id: "rating", label: "Customer rating", filter: true },
];

/** Site-wide switches for every part of the sort menu and filter sidebar on shop and category pages. */
export default function ShopBrowseSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);
  const hidden = siteStyle.shopHidden ?? [];
  const filtersOn = siteStyle.shopFilters !== false;

  function togglePart(id: ShopPart, on: boolean) {
    const next = on ? hidden.filter((p) => p !== id) : [...hidden.filter((p) => p !== id), id];
    set("shopHidden", next.length ? next : undefined);
  }

  return (
    <div className="mt-6 space-y-2 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Shop sorting &amp; filters</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={siteStyle.shopSort !== false} onChange={(e) => set("shopSort", e.target.checked ? undefined : false)} />
        Sort menu
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={filtersOn} onChange={(e) => set("shopFilters", e.target.checked ? undefined : false)} />
        Filter sidebar
      </label>
      <div className="space-y-1.5 pl-6">
        {PARTS.map((part) => (
          <label key={part.id} className={`flex items-center gap-2 text-sm ${part.filter && !filtersOn ? "opacity-50" : ""}`}>
            <input
              type="checkbox"
              checked={!hidden.includes(part.id)}
              disabled={part.filter && !filtersOn}
              onChange={(e) => togglePart(part.id, e.target.checked)}
            />
            {part.label}
          </label>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        On your shop and category pages. Shoppers can sort by featured, newest, price, on sale and rating. Filters with
        nothing to choose are hidden automatically (e.g. Category on a category page).
      </p>
    </div>
  );
}
