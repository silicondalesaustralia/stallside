import Link from "next/link";
import { notFound } from "next/navigation";
import NoBusinessYet from "@/components/NoBusinessYet";
import { prisma } from "@/lib/prisma";
import { costRecipe } from "@/lib/production/batch-costing";
import { loadCostContext } from "@/lib/production/load-cost-context";
import { loadProductLinks } from "@/lib/production/load-product-links";
import ProductionShell from "../../ProductionShell";
import ActionForm from "../../ActionForm";
import { cardClass } from "../../form-styles";
import { loadProductionScope } from "../../production-scope";
import { saveRecipe, setRecipeActive } from "../recipe-actions";
import RecipeSettingsFields from "./RecipeSettingsFields";
import RecipeLines from "./RecipeLines";
import CostBreakdown from "./CostBreakdown";
import LinkedProducts from "./LinkedProducts";

export default async function RecipePage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="recipes" subtitle="Recipe">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const [ctx, links] = await Promise.all([
    loadCostContext(scope.ownerId),
    loadProductLinks(scope.ownerId, recipeId),
  ]);
  const recipe = ctx.recipeRows.find((r) => r.id === recipeId);
  if (!recipe) notFound();

  const linkable = await prisma.product.findMany({
    where: {
      ownerId: scope.ownerId,
      standId: scope.stand.id,
      isArchived: false,
      memberId: null,
      productRecipe: null,
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const cost = costRecipe(recipe.id, ctx);
  const currency = scope.stand.currency;

  return (
    <ProductionShell
      active="recipes"
      subtitle={`${recipe.name} · makes ${recipe.yieldQuantity} ${recipe.yieldLabel}${recipe.isActive ? "" : " · archived"}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/production?recipe=${recipe.id}`}
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Make a batch
          </Link>
          <ActionForm action={setRecipeActive} submitLabel={recipe.isActive ? "Archive" : "Restore"} variant="secondary">
            <input type="hidden" name="id" value={recipe.id} />
            <input type="hidden" name="isActive" value={recipe.isActive ? "false" : "true"} />
          </ActionForm>
        </div>
      }
    >
      <Link href="/dashboard/production/recipes" className="text-sm text-[var(--leaf-dark)] underline">
        ← All recipes
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">What one batch uses</h2>
          <RecipeLines recipe={recipe} ctx={ctx} currency={currency} />
        </section>
        <section className={cardClass}>
          <h2 className="mb-2 font-semibold">Batch cost</h2>
          <CostBreakdown cost={cost} yieldQuantity={recipe.yieldQuantity} yieldLabel={recipe.yieldLabel} currency={currency} />
        </section>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Products and pricing</h2>
        <LinkedProducts
          recipe={recipe}
          batchTotalCents={cost.totalCents}
          links={links}
          linkable={linkable}
          packagingMaterials={ctx.materials.filter((m) => m.isActive && m.kind === "PACKAGING")}
          tax={scope.tax}
        />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">Recipe settings</h2>
        <ActionForm action={saveRecipe} submitLabel="Save recipe" className="mt-3 flex flex-col gap-3">
          <RecipeSettingsFields recipe={recipe} />
        </ActionForm>
      </section>
    </ProductionShell>
  );
}
