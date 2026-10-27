import { costRecipe, productUnitCostCents } from "./batch-costing";
import { loadCostContext } from "./load-cost-context";
import { loadProductLinks } from "./load-product-links";

export type ProductRecipeCost = {
  recipeId: string;
  recipeName: string;
  /** Recipe cost per product unit plus packaging, at today's material prices. */
  unitCostCents: number;
};

/** Production cost for a product linked to a recipe; null when it has no recipe. */
export async function loadProductRecipeCost(ownerId: string, productId: string): Promise<ProductRecipeCost | null> {
  const links = await loadProductLinks(ownerId);
  const link = links.find((l) => l.productId === productId);
  if (!link) return null;
  const ctx = await loadCostContext(ownerId);
  const recipe = ctx.recipes.get(link.recipeId);
  if (!recipe) return null;
  const cost = costRecipe(recipe.id, ctx);
  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    unitCostCents: Math.round(
      productUnitCostCents({
        batchTotalCents: cost.totalCents,
        yieldQuantity: recipe.yieldQuantity,
        yieldUnitsPerProduct: link.yieldUnitsPerProduct,
        packagingCostCents: link.packagingUnitCents,
      }),
    ),
  };
}
