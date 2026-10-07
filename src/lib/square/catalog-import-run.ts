import { prisma } from "@/lib/prisma";
import { InventorySource, ProductChannelType } from "@/generated/prisma/client";
import { uniqueProductSlug } from "@/lib/slug";
import { markFirstProductLive } from "@/lib/signup-timing";
import { listImportCandidates, type ImportCandidate } from "@/lib/square/catalog-import";
import { copySquareImage } from "@/lib/square/copy-square-image";
import { SQUARE_CURRENCY } from "@/lib/commerce/payment-rail";

export type ImportResult =
  | { ok: true; imported: number; images: number; standSlug: string }
  | { error: string };

async function slugTaken(standId: string, slug: string) {
  const found = await prisma.product.findFirst({ where: { standId, slug }, select: { id: true } });
  return Boolean(found);
}

async function createFromSquare(input: {
  ownerId: string;
  connectionId: string;
  stand: { id: string; currency: string };
  row: ImportCandidate;
}): Promise<{ productId: string; image: boolean }> {
  const { row, stand } = input;
  const slug = await uniqueProductSlug(stand.id, row.name, slugTaken);
  const stock = row.stock ?? 0;
  const now = new Date();

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        ownerId: input.ownerId,
        standId: stand.id,
        name: row.name.slice(0, 120),
        slug,
        description: row.description?.slice(0, 2000) ?? null,
        priceCents: row.priceCents ?? 0,
        sku: row.sku,
        upc: row.upc,
        currency: stand.currency,
        stockQuantity: stock,
        channels: {
          create: [
            { channelType: ProductChannelType.STAND, standId: stand.id, isEnabled: true },
            { channelType: ProductChannelType.ONLINE, standId: stand.id, isEnabled: true },
          ],
        },
      },
    });
    if (row.isFirstOfItem) {
      await tx.externalProductMapping.create({
        data: {
          connectionId: input.connectionId,
          productId: created.id,
          providerProductId: row.itemId,
          confirmedAt: now,
        },
      });
    }
    await tx.externalVariantMapping.create({
      data: {
        connectionId: input.connectionId,
        productId: created.id,
        providerVariationId: row.variationId,
        providerSku: row.sku,
        confirmedAt: now,
        lastSyncedAt: now,
      },
    });
    if (stock > 0) {
      await tx.inventoryAdjustment.create({
        data: {
          productId: created.id,
          ownerId: input.ownerId,
          standId: stand.id,
          changeQuantity: stock,
          previousQuantity: 0,
          newQuantity: stock,
          reason: "Imported from Square",
          source: InventorySource.EXTERNAL_SYNC,
        },
      });
    }
    return created;
  });

  if (!row.imageUrl) return { productId: product.id, image: false };
  const imageUrl = await copySquareImage({
    url: row.imageUrl,
    standId: stand.id,
    productId: product.id,
  });
  if (imageUrl) {
    await prisma.product.update({ where: { id: product.id }, data: { imageUrl } });
  }
  return { productId: product.id, image: Boolean(imageUrl) };
}

/** Create linked Vendl products from selected Square variations. */
export async function importSquareVariations(input: {
  ownerId: string;
  standId: string;
  variationIds: string[];
}): Promise<ImportResult> {
  const stand = await prisma.stand.findFirst({
    where: { id: input.standId, ownerId: input.ownerId },
    select: { id: true, slug: true, currency: true },
  });
  if (!stand) return { error: "Pick one of your businesses to import into." };
  if (stand.currency.trim().toUpperCase() !== SQUARE_CURRENCY) {
    return { error: "Square prices are in AUD - import into a business that sells in AUD." };
  }

  const listed = await listImportCandidates(input.ownerId);
  if ("error" in listed) return listed;
  const wanted = new Set(input.variationIds);
  const rows = listed.candidates.filter((c) => wanted.has(c.variationId));
  if (rows.length === 0) return { error: "Those Square items are already in Vendl." };

  const conn = await prisma.externalCommerceConnection.findFirstOrThrow({
    where: { ownerId: input.ownerId, provider: "SQUARE" },
    select: { id: true },
  });

  let imported = 0;
  let images = 0;
  for (const row of rows) {
    const res = await createFromSquare({
      ownerId: input.ownerId,
      connectionId: conn.id,
      stand,
      row,
    });
    imported += 1;
    if (res.image) images += 1;
  }
  if (imported > 0) await markFirstProductLive(input.ownerId);
  return { ok: true, imported, images, standSlug: stand.slug };
}
