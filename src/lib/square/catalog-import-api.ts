import { squareFetch } from "@/lib/square/client";

type SquareObject = {
  type?: string;
  id?: string;
  is_deleted?: boolean;
  image_data?: { url?: string };
  item_data?: {
    name?: string;
    description?: string;
    description_plaintext?: string;
    image_ids?: string[];
    variations?: Array<{
      id?: string;
      is_deleted?: boolean;
      item_variation_data?: {
        name?: string;
        sku?: string;
        upc?: string;
        price_money?: { amount?: number };
      };
    }>;
  };
};

export type SquareVariationRow = {
  itemId: string;
  variationId: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  sku: string | null;
  upc: string | null;
  imageUrl: string | null;
  /** First variation of its item; only it gets the item-level product mapping. */
  isFirstOfItem: boolean;
};

async function listObjects(accessToken: string): Promise<SquareObject[]> {
  const objects: SquareObject[] = [];
  let cursor: string | undefined;
  do {
    const q = new URLSearchParams({ types: "ITEM,IMAGE" });
    if (cursor) q.set("cursor", cursor);
    const page = await squareFetch<{ objects?: SquareObject[]; cursor?: string }>(
      `/v2/catalog/list?${q.toString()}`,
      { accessToken },
    );
    objects.push(...(page.objects ?? []));
    cursor = page.cursor;
  } while (cursor);
  return objects;
}

/** One row per Square item variation, with the item's first image URL. */
export async function listSquareVariationRows(
  accessToken: string,
): Promise<SquareVariationRow[]> {
  const objects = await listObjects(accessToken);
  const images = new Map(
    objects
      .filter((o) => o.type === "IMAGE" && o.id && o.image_data?.url)
      .map((o) => [o.id as string, o.image_data?.url as string]),
  );

  const rows: SquareVariationRow[] = [];
  for (const item of objects) {
    if (item.type !== "ITEM" || !item.id || item.is_deleted || !item.item_data) continue;
    const data = item.item_data;
    const itemName = (data.name ?? "").trim() || "Untitled item";
    const variations = (data.variations ?? []).filter((v) => v.id && !v.is_deleted);
    const imageId = data.image_ids?.[0];
    variations.forEach((v, index) => {
      const vd = v.item_variation_data ?? {};
      const vName = (vd.name ?? "").trim();
      const single = variations.length === 1 || !vName || vName === "Regular";
      rows.push({
        itemId: item.id as string,
        variationId: v.id as string,
        name: single ? itemName : `${itemName} - ${vName}`,
        description: (data.description_plaintext ?? data.description ?? "").trim() || null,
        priceCents: typeof vd.price_money?.amount === "number" ? vd.price_money.amount : null,
        sku: vd.sku?.trim() || null,
        upc: vd.upc?.trim() || null,
        imageUrl: imageId ? (images.get(imageId) ?? null) : null,
        isFirstOfItem: index === 0,
      });
    });
  }
  return rows;
}
