import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { formatMoney } from "@/lib/money";
import { centsPerBaseUnit, toNumber } from "@/lib/production/costing";
import { unitLabel, type MeasureUnitCode } from "@/lib/production/units";

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; show?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const showInactive = sp.show === "all";

  const ingredients = await prisma.ingredient.findMany({
    where: {
      ownerId: owner.id,
      ...(showInactive ? {} : { isActive: true }),
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const currency = owner.billingCurrency || "AUD";

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ingredients</h1>
          <p className="mt-1 text-[var(--muted)]">
            Purchase costs for recipe costing and production sheets.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/ingredients/new">
          + Add ingredient
        </DashPrimaryCta>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" name="show" value="all" defaultChecked={showInactive} />
          Show inactive
        </label>
        <button type="submit" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
          Filter
        </button>
      </form>

      {ingredients.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No ingredients yet. Add flour, butter, eggs — then build recipes.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {ingredients.map((ing) => {
            const per = centsPerBaseUnit({
              purchaseQuantity: toNumber(ing.purchaseQuantity),
              purchaseUnit: ing.purchaseUnit as MeasureUnitCode,
              purchasePriceCents: ing.purchasePriceCents,
              baseUnit: ing.baseUnit as MeasureUnitCode,
            });
            return (
              <li
                key={ing.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {ing.name}
                    {!ing.isActive ? (
                      <span className="ml-2 text-[var(--muted)]">(inactive)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {formatMoney(Math.round(per), currency)} /{" "}
                    {unitLabel(ing.baseUnit as MeasureUnitCode)}
                    {" · "}
                    buy {toNumber(ing.purchaseQuantity)}{" "}
                    {unitLabel(ing.purchaseUnit as MeasureUnitCode)} for{" "}
                    {formatMoney(ing.purchasePriceCents, currency)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/ingredients/${ing.id}`}
                  className="text-[var(--leaf-dark)] underline"
                >
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
