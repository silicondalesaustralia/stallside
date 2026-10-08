import { suggestCatalogMatches, type SquareCatalogItem, type MatchSuggestion } from "@/lib/square/catalog";

export type ReviewSuggestion = MatchSuggestion & {
  productName: string;
  squareName: string;
  /** How many Square items matched the same Vendl product (pick one). */
  competing: number;
};

type ProductRow = { id: string; name: string; sku: string | null; upc: string | null };

function squareLabel(item: SquareCatalogItem, variationId: string): string {
  const name = item.item_data?.name?.trim() || "Untitled item";
  const variations = item.item_data?.variations ?? [];
  const variation = variations.find((v) => v.id === variationId)?.item_variation_data?.name?.trim();
  return variations.length > 1 && variation ? `${name} (${variation})` : name;
}

/** Exact-match suggestions with names, skipping products and Square variations already linked. */
export function buildReviewSuggestions(input: {
  products: ProductRow[];
  items: SquareCatalogItem[];
  mappedProductIds: Set<string>;
  mappedVariationIds: Set<string>;
}): ReviewSuggestion[] {
  const products = input.products.filter((p) => !input.mappedProductIds.has(p.id));
  const raw = suggestCatalogMatches(products, input.items).filter(
    (s) => !input.mappedVariationIds.has(s.providerVariationId),
  );
  const productNames = new Map(products.map((p) => [p.id, p.name]));
  const items = new Map(input.items.map((i) => [i.id, i]));
  const perProduct = new Map<string, number>();
  for (const s of raw) perProduct.set(s.productId, (perProduct.get(s.productId) ?? 0) + 1);

  return raw.map((s) => {
    const item = items.get(s.providerProductId);
    return {
      ...s,
      productName: productNames.get(s.productId) ?? "Unknown product",
      squareName: item ? squareLabel(item, s.providerVariationId) : "Square item",
      competing: perProduct.get(s.productId) ?? 1,
    };
  });
}
