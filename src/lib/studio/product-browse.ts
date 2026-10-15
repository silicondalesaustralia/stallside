import { isOnSale } from "@/lib/product-sale-price";

export type BrowseProduct = {
  id: string;
  name: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  createdAtMs?: number;
  soldOut: boolean;
  categoryIds: string[];
  rating?: { average: number; count: number } | null;
};

export const SORT_OPTIONS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  sale: "On sale",
  rating: "Best rated",
  name: "Name: A to Z",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export type BrowseFilters = {
  categoryIds: string[];
  /** Inclusive price range in cents; null = no bound. */
  minCents: number | null;
  maxCents: number | null;
  inStock: boolean;
  onSale: boolean;
  /** Minimum average stars (e.g. 4 = "4 stars & up"); 0 = any. */
  minRating: number;
};

export const NO_FILTERS: BrowseFilters = {
  categoryIds: [],
  minCents: null,
  maxCents: null,
  inStock: false,
  onSale: false,
  minRating: 0,
};

export function activeFilterCount(f: BrowseFilters): number {
  return (
    f.categoryIds.length +
    (f.minCents != null || f.maxCents != null ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.onSale ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0)
  );
}

function discount(p: BrowseProduct): number {
  return isOnSale(p.priceCents, p.compareAtPriceCents) ? p.compareAtPriceCents! - p.priceCents : 0;
}

/** Products arrive in the seller's own order, which is "Featured"; every sort is stable on it. */
export function sortProducts<T extends BrowseProduct>(products: T[], sort: SortKey): T[] {
  const order = new Map(products.map((p, i) => [p.id, i]));
  const tie = (a: T, b: T) => order.get(a.id)! - order.get(b.id)!;
  const cmp: Record<SortKey, (a: T, b: T) => number> = {
    featured: () => 0,
    newest: (a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    sale: (a, b) => discount(b) - discount(a),
    rating: (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return [...products].sort((a, b) => cmp[sort](a, b) || tie(a, b));
}

export function matchesFilters(p: BrowseProduct, f: BrowseFilters): boolean {
  if (f.categoryIds.length > 0 && !f.categoryIds.some((id) => p.categoryIds.includes(id))) return false;
  if (f.minCents != null && p.priceCents < f.minCents) return false;
  if (f.maxCents != null && p.priceCents > f.maxCents) return false;
  if (f.inStock && p.soldOut) return false;
  if (f.onSale && !isOnSale(p.priceCents, p.compareAtPriceCents)) return false;
  if (f.minRating > 0 && (p.rating?.average ?? 0) < f.minRating) return false;
  return true;
}

/** Whole-currency-unit bounds for the price slider. */
export function priceBounds(products: BrowseProduct[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.priceCents);
  return {
    min: Math.floor(Math.min(...prices) / 100) * 100,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

export function browseProducts<T extends BrowseProduct>(products: T[], f: BrowseFilters, sort: SortKey): T[] {
  return sortProducts(
    products.filter((p) => matchesFilters(p, f)),
    sort,
  );
}
