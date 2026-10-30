import { prisma } from "@/lib/prisma";
import { costRecipe } from "./batch-costing";
import { isLowMaterial, loadCostContext } from "./load-cost-context";
import { loadProductLinks } from "./load-product-links";

export type BatchRecipeOption = {
  id: string;
  name: string;
  yieldQuantity: number;
  yieldLabel: string;
  batchCostCents: number;
  productId: string | null;
  yieldUnitsPerProduct: number | null;
};

/** Everything the "Record a batch" form and recent-batches list need for one business. */
export async function loadBatchFormData(ownerId: string, standId: string, batchLimit: number) {
  const [ctx, links, products, batches] = await Promise.all([
    loadCostContext(ownerId),
    loadProductLinks(ownerId),
    prisma.product.findMany({
      where: { ownerId, standId, isArchived: false, memberId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.productionBatch.findMany({
      where: { ownerId, standId },
      orderBy: [{ madeAt: "desc" }, { createdAt: "desc" }],
      take: batchLimit,
      include: { product: { select: { name: true } }, lines: true },
    }),
  ]);

  const recipes: BatchRecipeOption[] = ctx.recipeRows
    .filter((r) => r.isActive)
    .map((r) => {
      const link = links.find((l) => l.recipeId === r.id && l.standId === standId);
      return {
        id: r.id,
        name: r.name,
        yieldQuantity: r.yieldQuantity,
        yieldLabel: r.yieldLabel,
        batchCostCents: costRecipe(r.id, ctx).totalCents,
        productId: link?.productId ?? null,
        yieldUnitsPerProduct: link?.yieldUnitsPerProduct ?? null,
      };
    });

  return {
    recipes,
    products,
    lowMaterials: ctx.materials.filter((m) => m.isActive && isLowMaterial(m)).map((m) => m.name),
    batches: batches.map((b) => ({
      ...b,
      batchCount: Number(b.batchCount),
      productName: b.product?.name ?? null,
      lines: b.lines.map((l) => ({ ...l, quantity: Number(l.quantity) })),
    })),
  };
}
