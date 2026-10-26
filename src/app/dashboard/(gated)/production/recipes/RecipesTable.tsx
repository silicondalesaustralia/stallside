import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import { productUnitCostCents, type RecipeCost } from "@/lib/production/batch-costing";
import { money } from "@/lib/production/format";
import type { RecipeRow } from "@/lib/production/load-cost-context";
import type { ProductLink } from "@/lib/production/load-product-links";
import { formatPercent, marginPercent } from "@/lib/production/pricing";

const COLUMNS: DataColumn[] = [
  { label: "Recipe" },
  { label: "Status", hideBelow: "sm" },
  { label: "Batch cost", align: "right", hideBelow: "sm" },
  { label: "Per unit", align: "right" },
  { label: "Products · unit cost · margin", hideBelow: "md" },
];

function statusPill(recipe: RecipeRow, cost: RecipeCost): PillSpec {
  if (!recipe.isActive) return { label: "Archived", tone: "neutral" };
  if (cost.problems.length) return { label: "Needs attention", tone: "warning" };
  return { label: "Active", tone: "success" };
}

export default function RecipesTable({
  rows,
  links,
  currency,
}: {
  rows: { recipe: RecipeRow; cost: RecipeCost }[];
  links: ProductLink[];
  currency: string;
}) {
  return (
    <DataTable columns={COLUMNS} footer={`${rows.length} recipe${rows.length === 1 ? "" : "s"}`}>
      {rows.map(({ recipe, cost }) => {
        const href = `/dashboard/production/recipes/${recipe.id}`;
        return (
          <DataTableRow key={recipe.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {recipe.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">
                Makes {recipe.yieldQuantity} {recipe.yieldLabel} · {recipe.lines.length} line(s)
              </p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...statusPill(recipe, cost)} />
            </td>
            <td className={`${cellClass(COLUMNS[2])} font-receipt whitespace-nowrap`}>
              {money(cost.totalCents, currency)}
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>
              {money(cost.totalCents / recipe.yieldQuantity, currency)}
            </td>
            <td className={cellClass(COLUMNS[4])}>
              {links
                .filter((l) => l.recipeId === recipe.id)
                .map((l) => {
                  const unitCost = productUnitCostCents({
                    batchTotalCents: cost.totalCents,
                    yieldQuantity: recipe.yieldQuantity,
                    yieldUnitsPerProduct: l.yieldUnitsPerProduct,
                    packagingCostCents: l.packagingCostCents,
                  });
                  const margin = marginPercent(l.priceCents, l.priceCents - unitCost);
                  return (
                    <p key={l.productId}>
                      {l.productName} · <span className="font-receipt">{money(unitCost, l.currency)}</span> ·{" "}
                      <span className={margin != null && margin < 0 ? "font-semibold text-[var(--gone)]" : ""}>
                        {formatPercent(margin)}
                      </span>
                    </p>
                  );
                })}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
