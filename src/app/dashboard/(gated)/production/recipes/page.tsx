import NoBusinessYet from "@/components/NoBusinessYet";
import { costRecipe } from "@/lib/production/batch-costing";
import { loadCostContext } from "@/lib/production/load-cost-context";
import { loadProductLinks } from "@/lib/production/load-product-links";
import ProductionShell from "../ProductionShell";
import ActionForm from "../ActionForm";
import { cardClass, inputClass, labelClass } from "../form-styles";
import { loadProductionScope } from "../production-scope";
import { createRecipe } from "./recipe-actions";
import RecipesTable from "./RecipesTable";

export default async function RecipesPage() {
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="recipes" subtitle="Recipes and costings">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const [ctx, links] = await Promise.all([loadCostContext(scope.ownerId), loadProductLinks(scope.ownerId)]);
  const currency = scope.stand.currency;
  const rows = ctx.recipeRows.map((r) => ({ recipe: r, cost: costRecipe(r.id, ctx) }));

  return (
    <ProductionShell active="recipes" subtitle="What goes into each batch, what it costs, and your margin">
      {rows.length > 0 ? (
        <RecipesTable rows={rows} links={links} currency={currency} />
      ) : (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No recipes yet. A recipe (or parts list) says what one batch uses and how many it makes.
        </div>
      )}

      <section className={cardClass}>
        <h2 className="font-semibold">New recipe</h2>
        <ActionForm action={createRecipe} submitLabel="Create recipe" className="mt-3 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={labelClass}>
              Name
              <input name="name" required placeholder="Sourdough loaf, Dragon figurine" className={inputClass} />
            </label>
            <label className={labelClass}>
              One batch makes
              <input name="yieldQuantity" type="number" step="any" min="0" required placeholder="12" className={inputClass} />
            </label>
            <label className={labelClass}>
              Unit name
              <input name="yieldLabel" placeholder="loaves, prints, jars" className={inputClass} />
            </label>
          </div>
        </ActionForm>
      </section>
    </ProductionShell>
  );
}
