"use client";

import { useId, type ReactNode } from "react";
import { isOnSale } from "@/lib/product-sale-price";
import { type BrowseFilters, type BrowseProduct } from "@/lib/studio/product-browse";
import type { ShopPart } from "@/lib/storefront/site-style";
import PriceRangeSlider from "./PriceRangeSlider";

const RATINGS = [4, 3, 2] as const;

function Group({ part, title, children }: { part: ShopPart; title: string; children: ReactNode }) {
  return (
    <div className="shop-browse__group" data-shop-part={part} role="group" aria-label={title}>
      <p className="shop-browse__group-title">{title}</p>
      {children}
    </div>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="shop-browse__option">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
      {count != null ? <span className="shop-browse__count">{count}</span> : null}
    </label>
  );
}

/** Category, price, availability, sale and rating filters; groups with nothing to filter are left out. */
export default function ProductFilterSidebar({
  products,
  categories,
  bounds,
  currency,
  filters,
  onChange,
}: {
  products: BrowseProduct[];
  /** Empty hides the Category group (e.g. on a category page). */
  categories: { id: string; title: string }[];
  bounds: { min: number; max: number };
  currency: string;
  filters: BrowseFilters;
  onChange: (next: BrowseFilters) => void;
}) {
  const ratingName = useId();
  const set = (patch: Partial<BrowseFilters>) => onChange({ ...filters, ...patch });
  const usedCategories = categories
    .map((c) => ({ ...c, count: products.filter((p) => p.categoryIds.includes(c.id)).length }))
    .filter((c) => c.count > 0);
  const saleCount = products.filter((p) => isOnSale(p.priceCents, p.compareAtPriceCents)).length;
  const inStockCount = products.filter((p) => !p.soldOut).length;
  const rated = products.some((p) => (p.rating?.count ?? 0) > 0);

  function toggleCategory(id: string, on: boolean) {
    const ids = filters.categoryIds.filter((x) => x !== id);
    set({ categoryIds: on ? [...ids, id] : ids });
  }

  return (
    <div>
      {usedCategories.length > 1 ? (
        <Group part="category" title="Category">
          {usedCategories.map((c) => (
            <Check key={c.id} label={c.title} count={c.count} checked={filters.categoryIds.includes(c.id)} onChange={(v) => toggleCategory(c.id, v)} />
          ))}
        </Group>
      ) : null}
      {bounds.max > bounds.min ? (
        <Group part="price" title="Price">
          <PriceRangeSlider
            min={bounds.min}
            max={bounds.max}
            low={filters.minCents ?? bounds.min}
            high={filters.maxCents ?? bounds.max}
            currency={currency}
            onChange={(low, high) =>
              set({ minCents: low > bounds.min ? low : null, maxCents: high < bounds.max ? high : null })
            }
          />
        </Group>
      ) : null}
      {inStockCount < products.length ? (
        <Group part="stock" title="Availability">
          <Check label="In stock only" count={inStockCount} checked={filters.inStock} onChange={(v) => set({ inStock: v })} />
        </Group>
      ) : null}
      {saleCount > 0 ? (
        <Group part="sale" title="Offers">
          <Check label="On sale" count={saleCount} checked={filters.onSale} onChange={(v) => set({ onSale: v })} />
        </Group>
      ) : null}
      {rated ? (
        <Group part="rating" title="Customer rating">
          {RATINGS.map((stars) => (
            <label key={stars} className="shop-browse__option">
              <input type="radio" name={ratingName} checked={filters.minRating === stars} onChange={() => set({ minRating: stars })} />
              <span aria-hidden>{"★".repeat(stars) + "☆".repeat(5 - stars)}</span>
              <span className="sr-only">{stars} stars</span> &amp; up
            </label>
          ))}
          <label className="shop-browse__option">
            <input type="radio" name={ratingName} checked={filters.minRating === 0} onChange={() => set({ minRating: 0 })} />
            Any rating
          </label>
        </Group>
      ) : null}
    </div>
  );
}
