import type { RecipeProductCost, RecipesResponse } from "@/contracts/mobile/recipes";
import { costRecipe, productUnitCostCents } from "@/lib/production/batch-costing";
import { loadCostContext, type RecipeRow } from "@/lib/production/load-cost-context";
import { loadProductLinks, type ProductLink } from "@/lib/production/load-product-links";
import { marginPercent } from "@/lib/production/pricing";

/** Unit cost and margin of a product made from a recipe, as on the web Recipes table. */
export function toProductCost(link: ProductLink, recipe: RecipeRow, batchTotalCents: number): RecipeProductCost {
  const unitCost = productUnitCostCents({
    batchTotalCents,
    yieldQuantity: recipe.yieldQuantity,
    yieldUnitsPerProduct: link.yieldUnitsPerProduct,
    packagingCostCents: link.packagingUnitCents,
  });
  return {
    productId: link.productId,
    name: link.productName,
    unitCostCents: Math.round(unitCost),
    priceCents: link.priceCents,
    marginPercent: marginPercent(link.priceCents, link.priceCents - unitCost),
    currency: link.currency,
  };
}

/** Every recipe the owner has, with batch and unit costs and linked product margins. */
export async function loadRecipesResponse(ownerId: string, currency: string): Promise<RecipesResponse> {
  const [ctx, links] = await Promise.all([loadCostContext(ownerId), loadProductLinks(ownerId)]);
  return {
    currency,
    recipes: ctx.recipeRows.map((recipe) => {
      const cost = costRecipe(recipe.id, ctx);
      return {
        id: recipe.id,
        name: recipe.name,
        yieldQuantity: recipe.yieldQuantity,
        yieldLabel: recipe.yieldLabel,
        lineCount: recipe.lines.length,
        isActive: recipe.isActive,
        needsAttention: cost.problems.length > 0,
        batchCostCents: Math.round(cost.totalCents),
        unitCostCents: Math.round(recipe.yieldQuantity > 0 ? cost.totalCents / recipe.yieldQuantity : 0),
        products: links
          .filter((l) => l.recipeId === recipe.id)
          .map((l) => toProductCost(l, recipe, cost.totalCents)),
      };
    }),
  };
}
