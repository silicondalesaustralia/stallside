import { squareFetch } from "@/lib/square/client";

export type SquareCatalogItem = {
  type?: string;
  id?: string;
  item_data?: {
    name?: string;
    variations?: Array<{
      id?: string;
      item_variation_data?: {
        name?: string;
        sku?: string;
        upc?: string;
        price_money?: { amount?: number; currency?: string };
      };
    }>;
  };
};

export async function listSquareCatalogItems(accessToken: string) {
  const items: SquareCatalogItem[] = [];
  let cursor: string | undefined;
  do {
    const q = cursor ? `?cursor=${encodeURIComponent(cursor)}&types=ITEM` : "?types=ITEM";
    const page = await squareFetch<{
      objects?: SquareCatalogItem[];
      cursor?: string;
    }>(`/v2/catalog/list${q}`, { accessToken });
    items.push(...(page.objects ?? []));
    cursor = page.cursor;
  } while (cursor);
  return items;
}

export type MatchSuggestion = {
  productId: string;
  providerProductId: string;
  providerVariationId: string;
  confidence: "exact_sku" | "exact_upc" | "exact_name";
};

/** Never permanently map from fuzzy name alone — exact matches only. */
export function suggestCatalogMatches(
  products: Array<{ id: string; name: string; sku: string | null; upc: string | null }>,
  items: SquareCatalogItem[],
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];
  for (const item of items) {
    for (const variation of item.item_data?.variations ?? []) {
      const vid = variation.id;
      const pid = item.id;
      if (!vid || !pid) continue;
      const sku = variation.item_variation_data?.sku?.trim().toLowerCase();
      const upc = variation.item_variation_data?.upc?.trim().toLowerCase();
      const vName = `${item.item_data?.name ?? ""} ${variation.item_variation_data?.name ?? ""}`
        .trim()
        .toLowerCase();

      for (const product of products) {
        if (sku && product.sku?.trim().toLowerCase() === sku) {
          suggestions.push({
            productId: product.id,
            providerProductId: pid,
            providerVariationId: vid,
            confidence: "exact_sku",
          });
          break;
        }
        if (upc && product.upc?.trim().toLowerCase() === upc) {
          suggestions.push({
            productId: product.id,
            providerProductId: pid,
            providerVariationId: vid,
            confidence: "exact_upc",
          });
          break;
        }
        if (product.name.trim().toLowerCase() === vName) {
          suggestions.push({
            productId: product.id,
            providerProductId: pid,
            providerVariationId: vid,
            confidence: "exact_name",
          });
          break;
        }
      }
    }
  }
  return suggestions;
}
