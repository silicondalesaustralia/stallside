"use client";

import { useId, useMemo, useState } from "react";
import type { StudioMetadata } from "@/lib/studio/types";
import {
  NO_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  browseProducts,
  priceBounds,
  type SortKey,
} from "@/lib/studio/product-browse";
import StudioProductGridList, { type ProductGridDisplay } from "./StudioProductGridList";
import ProductFilterSidebar from "./ProductFilterSidebar";

/**
 * Shop / category product grid with a sort menu and a filter sidebar (a toggle on phones).
 * Site Wide Edits can hide either through CSS, so the editor previews the switch instantly.
 */
export default function StudioProductBrowser({
  products,
  categories,
  display,
}: {
  products: StudioMetadata["products"];
  categories: { id: string; title: string }[];
  display: ProductGridDisplay;
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [open, setOpen] = useState(false);
  const sidebarId = useId();
  const bounds = useMemo(() => priceBounds(products), [products]);
  const shown = useMemo(() => browseProducts(products, filters, sort), [products, filters, sort]);
  const active = activeFilterCount(filters);

  return (
    <div className="shop-browse shop-browse--filters">
      <aside id={sidebarId} className="shop-browse__sidebar" aria-label="Filters" data-open={open ? "" : undefined}>
        <ProductFilterSidebar
          products={products}
          categories={categories}
          bounds={bounds}
          currency={display.cardMeta.currency}
          filters={filters}
          onChange={setFilters}
        />
      </aside>
      <div>
        <div className="shop-browse__toolbar">
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            <span data-shop-part="count" className="mr-3">
              {shown.length} {shown.length === 1 ? "product" : "products"}
            </span>
            {active > 0 ? (
              <button type="button" className="font-semibold underline" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="shop-browse__toggle" aria-expanded={open} aria-controls={sidebarId} onClick={() => setOpen((o) => !o)}>
              Filters{active > 0 ? ` (${active})` : ""}
            </button>
            <label className="shop-browse__sort flex items-center gap-2 text-sm text-[var(--muted)]">
              Sort by
              <select className="shop-browse__select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>{SORT_OPTIONS[key]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {shown.length > 0 ? (
          <StudioProductGridList products={shown} display={display} className="mt-5" />
        ) : (
          <p className="mt-8 text-[var(--muted)]">No products match these filters.</p>
        )}
      </div>
    </div>
  );
}
