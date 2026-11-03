import type { CostContext, CostLine } from "@/lib/production/batch-costing";
import { recipeLineCostCents } from "@/lib/production/line-cost";
import { formatQuantity, unitLabel } from "@/lib/production/unit-convert";
import { formatAud } from "@/lib/home-costing-fees";

const INPUT =
  "w-full rounded-md border border-[var(--line)] bg-white px-2 py-1 text-right tabular-nums focus:border-[var(--leaf)] focus:outline-none";

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type Props = {
  lines: CostLine[];
  ctx: CostContext;
  wasteFactor: number;
  onQuantity: (lineId: string, quantity: number) => void;
  onPackPrice: (ingredientId: string, cents: number) => void;
};

export default function HomeCostingMaterials({ lines, ctx, wasteFactor, onQuantity, onPackPrice }: Props) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full text-sm">
        <thead className="hidden border-b border-[var(--line)] text-left text-[11px] uppercase tracking-[0.08em] text-[var(--muted)] sm:table-header-group">
          <tr>
            <th className="px-3 py-2 font-semibold">Ingredient</th>
            <th className="px-3 py-2 font-semibold">Per batch</th>
            <th className="px-3 py-2 font-semibold">Pack price</th>
            <th className="px-3 py-2 text-right font-semibold">Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {lines.map((line) => {
            const ingredient = line.ingredientId ? ctx.ingredients.get(line.ingredientId) : undefined;
            if (!ingredient || !line.unit) return null;
            const cents = recipeLineCostCents(line, ctx, wasteFactor);
            return (
              <tr key={line.id} className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3 py-2.5 sm:table-row sm:p-0">
                <td className="font-semibold text-[var(--field)] sm:px-3 sm:py-1.5">{ingredient.name}</td>
                <td className="order-1 sm:order-none sm:px-3 sm:py-1.5">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:hidden">
                    Per batch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <input
                      aria-label={`${ingredient.name} per batch`}
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={line.quantity}
                      onChange={(e) => onQuantity(line.id, toNumber(e.target.value))}
                      className={`${INPUT} max-w-[76px]`}
                    />
                    <span className="text-xs text-[var(--muted)]">{unitLabel(line.unit)}</span>
                  </span>
                </td>
                <td className="order-1 sm:order-none sm:px-3 sm:py-1.5">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:hidden">
                    Pack price
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--muted)]">$</span>
                    <input
                      aria-label={`${ingredient.name} pack price`}
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={(ingredient.purchasePriceCents / 100).toFixed(2)}
                      onChange={(e) => onPackPrice(ingredient.id, Math.round(toNumber(e.target.value) * 100))}
                      className={`${INPUT} max-w-[84px]`}
                    />
                    <span className="whitespace-nowrap text-xs text-[var(--muted)]">
                      / {formatQuantity(ingredient.purchaseQuantity, ingredient.purchaseUnit)}
                    </span>
                  </span>
                </td>
                <td className="text-right font-semibold tabular-nums sm:px-3 sm:py-1.5 sm:font-normal">{cents == null ? "—" : formatAud(cents)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
