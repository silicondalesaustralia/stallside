import type { RecipeDetailResponse } from "@/contracts/mobile/recipes";
import { costRecipe } from "@/lib/production/batch-costing";
import { recipeLineCostCents } from "@/lib/production/line-cost";
import { loadCostContext } from "@/lib/production/load-cost-context";
import { loadProductLinks } from "@/lib/production/load-product-links";
import { loadLinkableProducts } from "@/lib/production/linkable-products";
import { formatQuantity } from "@/lib/production/unit-convert";
import { toProductCost } from "./recipes-dto";

const round = (cents: number) => Math.round(cents);

/** One recipe's page: lines, batch cost, linked products and what can be added. */
export async function loadRecipeDetail(
  ownerId: string,
  stand: { id: string; currency: string },
  recipeId: string,
): Promise<RecipeDetailResponse | null> {
  const [ctx, links, linkable] = await Promise.all([
    loadCostContext(ownerId),
    loadProductLinks(ownerId, recipeId),
    loadLinkableProducts(ownerId, stand.id),
  ]);
  const recipe = ctx.recipeRows.find((r) => r.id === recipeId);
  if (!recipe) return null;
  const cost = costRecipe(recipe.id, ctx);
  const wasteFactor = 1 + recipe.wastePercent / 100;

  return {
    currency: stand.currency,
    recipe: {
      id: recipe.id,
      name: recipe.name,
      isActive: recipe.isActive,
      yieldQuantity: recipe.yieldQuantity,
      yieldLabel: recipe.yieldLabel,
      wastePercent: recipe.wastePercent,
      labourMinutes: recipe.labourMinutes,
      labourRateCents: recipe.labourRateCents,
      overheadCents: recipe.overheadCents,
      instructions: recipe.instructions,
    },
    cost: {
      materialCents: round(cost.materialCents),
      labourCents: round(cost.labourCents),
      overheadCents: round(cost.overheadCents),
      totalCents: round(cost.totalCents),
      unitCents: round(recipe.yieldQuantity > 0 ? cost.totalCents / recipe.yieldQuantity : 0),
      problems: [...new Set(cost.problems)],
    },
    lines: recipe.lines.map((line) => {
      const component = line.componentRecipeId ? ctx.recipes.get(line.componentRecipeId) : undefined;
      const componentRow = component ? ctx.recipeRows.find((r) => r.id === component.id) : undefined;
      const ingredient = line.ingredientId ? ctx.ingredients.get(line.ingredientId) : undefined;
      const lineCost = recipeLineCostCents(line, ctx, wasteFactor);
      return {
        id: line.id,
        kind: component ? ("recipe" as const) : ("material" as const),
        recipeId: component?.id ?? null,
        name: component ? `${component.name} (sub-recipe)` : (ingredient?.name ?? "Missing"),
        quantityLabel: line.unit
          ? formatQuantity(line.quantity, line.unit)
          : `${line.quantity} ${componentRow?.yieldLabel ?? ""}`.trim(),
        costCents: lineCost == null ? null : round(lineCost),
      };
    }),
    products: links.map((l) => ({
      ...toProductCost(l, recipe, cost.totalCents),
      yieldUnitsPerProduct: l.yieldUnitsPerProduct,
      packagingCents: round(l.packagingUnitCents),
      stockQuantity: l.stockQuantity,
    })),
    materials: ctx.materials
      .filter((m) => m.isActive)
      .map((m) => ({ id: m.id, name: m.name, baseUnit: m.baseUnit })),
    subRecipes: ctx.recipeRows
      .filter((r) => r.id !== recipe.id && r.isActive)
      .map((r) => ({ id: r.id, name: r.name, yieldLabel: r.yieldLabel })),
    linkable,
  };
}
