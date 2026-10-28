import { prisma } from "@/lib/prisma";
import { InventorySource, type Prisma } from "@/generated/prisma/client";
import { uniqueProductSlug } from "@/lib/slug";
import { copyRemoteImage } from "@/lib/copy-remote-image";
import { saveVariants } from "@/lib/product-variants/save-variants";
import type { ImportProduct } from "../import-product";
import { linkImportCategory } from "./import-category";
import { matchImportProduct } from "./match-product";

export type ImportContext = {
  ownerId: string;
  stand: { id: string; currency: string };
  source: string;
  updateExisting: boolean;
};

type Tx = Prisma.TransactionClient;

async function slugTaken(standId: string, slug: string) {
  return Boolean(await prisma.product.findFirst({ where: { standId, slug }, select: { id: true } }));
}

function variantsPayload(item: ImportProduct) {
  return {
    optionNames: item.optionNames,
    variants: item.variants.map((v) => ({
      values: v.values,
      sku: v.sku,
      upc: v.upc,
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      costCents: v.costCents,
      stockQuantity: v.stock ?? 0,
    })),
  };
}

async function logStock(tx: Tx, ctx: ImportContext, productId: string, prev: number, next: number) {
  if (prev === next) return;
  await tx.inventoryAdjustment.create({
    data: {
      productId,
      ownerId: ctx.ownerId,
      standId: ctx.stand.id,
      changeQuantity: next - prev,
      previousQuantity: prev,
      newQuantity: next,
      reason: `Imported from ${ctx.source}`,
      source: InventorySource.OWNER_MANUAL,
    },
  });
}

/** Creates or updates one imported product. */
export async function applyImportProduct(
  ctx: ImportContext,
  item: ImportProduct,
): Promise<"created" | "updated" | "skipped" | { error: string }> {
  const existing = await matchImportProduct(ctx.stand.id, item);
  if (existing && !ctx.updateExisting) return "skipped";
  const hasVariants = item.variants.length > 0;
  if (existing && hasVariants && (existing.isPreOrder || existing._count.stockLots > 0)) {
    return { error: "Matches a pre-order or supplier product, which can't have variants." };
  }
  const simpleStock = !hasVariants && !(existing && existing._count.variants > 0);

  const productId = await prisma.$transaction(async (tx) => {
    const fields = {
      description: item.description || null,
      priceCents: item.priceCents,
      costCents: item.costCents,
      sku: item.sku,
      upc: item.upc,
      ...(item.gstFree === null ? {} : { gstFree: item.gstFree }),
    };
    let id: string;
    if (existing) {
      id = existing.id;
      await tx.product.update({
        where: { id },
        data: { ...fields, ...(simpleStock && item.stock !== null ? { stockQuantity: item.stock } : {}) },
      });
      if (simpleStock && item.stock !== null) {
        await logStock(tx, ctx, id, existing.stockQuantity, item.stock);
      }
    } else {
      const slug = await uniqueProductSlug(ctx.stand.id, item.name, slugTaken);
      const created = await tx.product.create({
        data: {
          ...fields,
          ownerId: ctx.ownerId,
          standId: ctx.stand.id,
          name: item.name,
          slug,
          currency: ctx.stand.currency,
          isHidden: item.hidden,
          stockQuantity: simpleStock ? (item.stock ?? 0) : 0,
        },
        select: { id: true },
      });
      id = created.id;
      if (simpleStock) await logStock(tx, ctx, id, 0, item.stock ?? 0);
    }
    if (hasVariants) await saveVariants(tx, id, variantsPayload(item));
    if (item.category) await linkImportCategory(tx, ctx.ownerId, id, item.category);
    return id;
  });

  if (item.imageUrl && !existing?.imageUrl) {
    const url = await copyRemoteImage({
      url: item.imageUrl,
      standId: ctx.stand.id,
      productId,
      label: ctx.source,
    });
    if (url) await prisma.product.update({ where: { id: productId }, data: { imageUrl: url } });
  }
  return existing ? "updated" : "created";
}
