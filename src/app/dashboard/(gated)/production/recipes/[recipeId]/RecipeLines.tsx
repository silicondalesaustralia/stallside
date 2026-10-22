import Link from "next/link";
import { ingredientCostPerBase, type CostContext } from "@/lib/production/batch-costing";
import { money } from "@/lib/production/format";
import type { RecipeRow } from "@/lib/production/load-cost-context";
import { convertQuantity, formatQuantity } from "@/lib/production/unit-convert";
import ActionForm from "../../ActionForm";
import UnitSelect from "../../UnitSelect";
import { inputClass, labelClass, tdClass, thClass } from "../../form-styles";
import { addRecipeLine, removeRecipeLine } from "../recipe-line-actions";

function lineCost(line: RecipeRow["lines"][number], ctx: CostContext, wasteFactor: number): number | null {
  if (!line.ingredientId || !line.unit) return null;
  const ingredient = ctx.ingredients.get(line.ingredientId);
  const perBase = ingredient ? ingredientCostPerBase(ingredient) : null;
  const base = ingredient ? convertQuantity(line.quantity, line.unit, ingredient.baseUnit) : null;
  return perBase == null || base == null ? null : perBase * base * wasteFactor;
}

export default function RecipeLines({
  recipe,
  ctx,
  currency,
}: {
  recipe: RecipeRow;
  ctx: CostContext & { materials: { id: string; name: string; isActive: boolean }[]; recipeRows: RecipeRow[] };
  currency: string;
}) {
  const wasteFactor = 1 + recipe.wastePercent / 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="border-b border-[var(--line)]">
            <tr>
              <th className={thClass}>Ingredient / part</th>
              <th className={`${thClass} text-right`}>Per batch</th>
              <th className={`${thClass} text-right`}>Cost</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {recipe.lines.length === 0 ? (
              <tr>
                <td colSpan={4} className={`${tdClass} text-[var(--muted)]`}>No lines yet. Add what one batch uses below.</td>
              </tr>
            ) : null}
            {recipe.lines.map((line) => {
              const component = line.componentRecipeId
                ? ctx.recipeRows.find((r) => r.id === line.componentRecipeId)
                : undefined;
              const ingredient = line.ingredientId ? ctx.ingredients.get(line.ingredientId) : undefined;
              const cost = lineCost(line, ctx, wasteFactor);
              return (
                <tr key={line.id}>
                  <td className={tdClass}>
                    {component ? (
                      <Link href={`/dashboard/production/recipes/${component.id}`} className="font-semibold underline">
                        {component.name} (sub-recipe)
                      </Link>
                    ) : (
                      <span className="font-semibold">{ingredient?.name ?? "Missing"}</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right tabular-nums`}>
                    {line.unit ? formatQuantity(line.quantity, line.unit) : `${line.quantity} ${component?.yieldLabel ?? ""}`}
                  </td>
                  <td className={`${tdClass} text-right tabular-nums`}>
                    {cost == null ? (component ? "see sub-recipe" : "—") : money(cost, currency)}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <ActionForm action={removeRecipeLine} submitLabel="Remove" variant="danger" className="inline-flex">
                      <input type="hidden" name="id" value={line.id} />
                    </ActionForm>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ActionForm action={addRecipeLine} submitLabel="Add line" variant="secondary" resetOnSuccess className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="recipeId" value={recipe.id} />
        <label className={`${labelClass} min-w-[14rem] flex-1`}>
          Add
          <select name="source" required defaultValue="" className={inputClass}>
            <option value="" disabled>Choose a material or sub-recipe…</option>
            <optgroup label="Materials">
              {ctx.materials.filter((m) => m.isActive).map((m) => (
                <option key={m.id} value={`ing:${m.id}`}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label="Sub-recipes (quantity in their units)">
              {ctx.recipeRows.filter((r) => r.id !== recipe.id && r.isActive).map((r) => (
                <option key={r.id} value={`rec:${r.id}`}>{r.name}</option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className={`${labelClass} w-28`}>
          Quantity
          <input name="quantity" type="number" step="any" min="0" required className={inputClass} />
        </label>
        <label className={`${labelClass} w-24`}>
          Unit
          <UnitSelect name="unit" label="Unit" defaultValue="G" />
        </label>
      </ActionForm>
    </div>
  );
}
