import { squareFetch } from "@/lib/square/client";

export type SquarePushProduct = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  sku: string | null;
  upc: string | null;
};

export type SquareCreatedItem = {
  productId: string;
  itemId: string;
  variationId: string;
  sku: string | null;
};

function plainDescription(html: string | null): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 4096) : undefined;
}

function itemObject(p: SquarePushProduct) {
  const sku = (p.sku ?? p.upc)?.trim() || undefined;
  const priced = p.priceCents > 0;
  return {
    type: "ITEM",
    id: `#item-${p.id}`,
    present_at_all_locations: true,
    item_data: {
      name: p.name.slice(0, 512),
      description: plainDescription(p.description),
      variations: [
        {
          type: "ITEM_VARIATION",
          id: `#var-${p.id}`,
          present_at_all_locations: true,
          item_variation_data: {
            item_id: `#item-${p.id}`,
            name: "Regular",
            pricing_type: priced ? "FIXED_PRICING" : "VARIABLE_PRICING",
            price_money: priced
              ? { amount: p.priceCents, currency: p.currency.toUpperCase() }
              : undefined,
            sku,
            track_inventory: true,
          },
        },
      ],
    },
  };
}

/** Create one Square item + variation per Vendl product (each in its own batch). */
export async function createSquareItems(input: {
  accessToken: string;
  idempotencyKey: string;
  products: SquarePushProduct[];
}): Promise<SquareCreatedItem[]> {
  if (input.products.length === 0) return [];
  const res = await squareFetch<{
    id_mappings?: Array<{ client_object_id?: string; object_id?: string }>;
  }>("/v2/catalog/batch-upsert", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      batches: input.products.map((p) => ({ objects: [itemObject(p)] })),
    },
  });

  const ids = new Map(
    (res.id_mappings ?? [])
      .filter((m) => m.client_object_id && m.object_id)
      .map((m) => [m.client_object_id as string, m.object_id as string]),
  );
  return input.products.flatMap((p) => {
    const itemId = ids.get(`#item-${p.id}`);
    const variationId = ids.get(`#var-${p.id}`);
    if (!itemId || !variationId) return [];
    return [
      {
        productId: p.id,
        itemId,
        variationId,
        sku: (p.sku ?? p.upc)?.trim() || null,
      },
    ];
  });
}
