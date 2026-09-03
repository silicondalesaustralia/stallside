import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/production/costing";
import { costRecipe } from "@/lib/production/recipe-cost";
import { saveProductRecipe } from "@/app/dashboard/(gated)/recipes/actions";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default async function ProductProductionSection({
  ownerId,
  productId,
  priceCents,
  currency,
  packagingCostCents,
  productRecipe,
}: {
  ownerId: string;
  productId: string;
  priceCents: number;
  currency: string;
  packagingCostCents: number | null;
  productRecipe: {
    recipeId: string;
    yieldUnitsPerProduct: { toString(): string };
    recipe: {
      id: string;
      name: string;
      yieldQuantity: { toString(): string };
      yieldLabel: string;
    };
  } | null;
}) {
  const recipes = await prisma.recipe.findMany({
    where: { ownerId, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      yieldQuantity: true,
      yieldLabel: true,
    },
  });

  let estimate: {
    ingredientCostCents: number;
    contributionCents: number;
    costPct: number | null;
  } | null = null;

  if (productRecipe) {
    try {
      const cost = await costRecipe(ownerId, productRecipe.recipeId);
      const yup = toNumber(productRecipe.yieldUnitsPerProduct);
      const ingredientCostCents = Math.round(cost.costPerYieldUnitCents * yup);
      const packaging = packagingCostCents ?? 0;
      const contributionCents = priceCents - ingredientCostCents - packaging;
      estimate = {
        ingredientCostCents,
        contributionCents,
        costPct:
          priceCents > 0 ? (ingredientCostCents / priceCents) * 100 : null,
      };
    } catch {
      estimate = null;
    }
  }

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">Production</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Optional recipe link for ingredient cost and production sheets. Not
          shown to customers.
        </p>
      </div>

      {recipes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No recipes yet.{" "}
          <Link href="/dashboard/recipes/new" className="underline">
            Create a recipe
          </Link>{" "}
          first.
        </p>
      ) : (
        <form action={saveProductRecipe} className="flex flex-col gap-3">
          <input type="hidden" name="productId" value={productId} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Recipe</span>
            <select
              name="recipeId"
              defaultValue={productRecipe?.recipeId ?? ""}
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            >
              <option value="">None</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (makes {r.yieldQuantity.toString()} {r.yieldLabel})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">This product contains (yield units)</span>
            <input
              name="yieldUnitsPerProduct"
              inputMode="decimal"
              defaultValue={
                productRecipe
                  ? String(toNumber(productRecipe.yieldUnitsPerProduct))
                  : "1"
              }
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            />
            {productRecipe ? (
              <span className="text-xs text-[var(--muted)]">
                Recipe makes {productRecipe.recipe.yieldQuantity.toString()}{" "}
                {productRecipe.recipe.yieldLabel}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Packaging / materials ($ per unit)</span>
            <input
              name="packagingCost"
              inputMode="decimal"
              defaultValue={
                packagingCostCents != null
                  ? (packagingCostCents / 100).toFixed(2)
                  : ""
              }
              placeholder="0.70"
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          {estimate ? (
            <p className="text-sm text-[var(--muted)]">
              Est. ingredient cost {formatMoney(estimate.ingredientCostCents, currency)}
              {estimate.costPct != null
                ? ` (${estimate.costPct.toFixed(1)}% of price)`
                : ""}
              {" · "}
              Selling {formatMoney(priceCents, currency)}
              {" · "}
              Gross contribution before other costs{" "}
              {formatMoney(estimate.contributionCents, currency)}
            </p>
          ) : null}
          <button type="submit" className={`${dashCtaClass} self-start`}>
            Save production
          </button>
        </form>
      )}
    </section>
  );
}
