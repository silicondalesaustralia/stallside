import { prisma } from "@/lib/prisma";
import { InventorySource } from "@/generated/prisma/client";
import { markFirstProductLive } from "@/lib/signup-timing";
import type { DataContext, Importer, ImportResult, PlannedRow } from "../context";
import { copyImages } from "../image-copy";
import { planProducts, type ProductRow } from "./products-import-plan";
import { categoryIdsForSlugs, replaceProductCategories, syncProductChannels } from "./products-import-links";

async function writeProduct(
  row: PlannedRow<ProductRow>,
  ctx: DataContext,
  categoryCache: Map<string, string>,
  warn: (message: string) => void,
): Promise<"created" | "updated"> {
  const d = row.data;
  const before = row.existingId
    ? await prisma.product.findUnique({
        where: { id: row.existingId },
        select: { stockQuantity: true, imageUrl: true, galleryImageUrls: true },
      })
    : null;
  const rowWarn = (m: string) => warn(`Row ${row.line}: ${m}`);
  const [imageUrl] =
    d.imageUrl && d.imageUrl !== before?.imageUrl
      ? await copyImages([d.imageUrl], ctx.stand.id, "products", rowWarn)
      : [];
  const galleryUnchanged =
    d.galleryImageUrls?.join("|") === before?.galleryImageUrls.join("|");
  const gallery =
    d.galleryImageUrls && !galleryUnchanged
      ? await copyImages(d.galleryImageUrls, ctx.stand.id, "products", rowWarn)
      : undefined;

  const fields = {
    name: d.name,
    description: d.description,
    priceCents: d.priceCents,
    compareAtPriceCents: d.compareAtPriceCents,
    costCents: d.costCents,
    sku: d.sku,
    upc: d.upc,
    stockQuantity: d.stockQuantity,
    lowStockThreshold: d.lowStockThreshold,
    isActive: d.isActive,
    isHidden: d.isHidden,
    preOrderEligible: d.preOrderEligible,
    imageUrl,
    galleryImageUrls: gallery,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    sortOrder: d.sortOrder,
    gstFree: d.gstFree,
  };
  const product = row.existingId
    ? await prisma.product.update({ where: { id: row.existingId }, data: fields })
    : await prisma.product.create({
        data: {
          ...fields,
          ownerId: ctx.ownerId,
          standId: ctx.stand.id,
          slug: d.slug,
          name: d.name ?? d.slug,
          priceCents: d.priceCents ?? 0,
          currency: ctx.stand.currency,
        },
      });

  const previous = before?.stockQuantity ?? 0;
  if (d.stockQuantity !== undefined && d.stockQuantity !== previous) {
    await prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: ctx.ownerId,
        standId: ctx.stand.id,
        changeQuantity: d.stockQuantity - previous,
        previousQuantity: previous,
        newQuantity: d.stockQuantity,
        reason: row.existingId ? "Imported stock" : "Initial stock (import)",
        source: InventorySource.OWNER_MANUAL,
      },
    });
  }

  await syncProductChannels(product.id, ctx, !row.existingId, d);
  if (d.categories) {
    const ids = await categoryIdsForSlugs(d.categories, ctx, categoryCache, warn);
    await replaceProductCategories(product.id, ids);
  }
  if (d.mainCategory) {
    const [mainId] = await categoryIdsForSlugs([d.mainCategory], ctx, categoryCache, warn);
    await prisma.product.update({ where: { id: product.id }, data: { primaryCategoryId: mainId } });
  }
  return row.existingId ? "updated" : "created";
}

export const productsImporter: Importer<ProductRow> = {
  plan: planProducts,
  async apply(plan, ctx): Promise<ImportResult> {
    const warnings: string[] = [];
    const categoryCache = new Map<string, string>();
    let created = 0;
    let updated = 0;
    for (const row of plan.rows) {
      const outcome = await writeProduct(row, ctx, categoryCache, (m) => warnings.push(m));
      if (outcome === "created") created += 1;
      else updated += 1;
    }
    if (created > 0) await markFirstProductLive(ctx.ownerId);
    return { created, updated, warnings };
  },
};
