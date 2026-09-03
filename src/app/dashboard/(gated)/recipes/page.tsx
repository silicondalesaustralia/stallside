import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { formatMoney } from "@/lib/money";
import { costRecipe } from "@/lib/production/recipe-cost";
import { roundCents } from "@/lib/production/costing";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; show?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const showInactive = sp.show === "all";

  const recipes = await prisma.recipe.findMany({
    where: {
      ownerId: owner.id,
      ...(showInactive ? {} : { isActive: true }),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: { _count: { select: { lines: true, productLinks: true } } },
  });

  const currency = owner.billingCurrency || "AUD";
  const costs = await Promise.all(
    recipes.map(async (r) => {
      try {
        const c = await costRecipe(owner.id, r.id);
        return { id: r.id, total: c.totalCents, per: c.costPerYieldUnitCents, label: c.yieldLabel };
      } catch {
        return { id: r.id, total: null, per: null, label: r.yieldLabel };
      }
    }),
  );
  const costById = new Map(costs.map((c) => [c.id, c]));

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Recipes</h1>
          <p className="mt-1 text-[var(--muted)]">
            Yield, ingredient cost, and links to products for production.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/ingredients"
            className="text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            Ingredients
          </Link>
          <DashPrimaryCta href="/dashboard/recipes/new">+ New recipe</DashPrimaryCta>
        </div>
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

      {recipes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No recipes yet. Add ingredients first, then build a recipe with a yield.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {recipes.map((recipe) => {
            const c = costById.get(recipe.id);
            return (
              <li
                key={recipe.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {recipe.name}
                    {!recipe.isActive ? (
                      <span className="ml-2 text-[var(--muted)]">(inactive)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    Yield {recipe.yieldQuantity.toString()} {recipe.yieldLabel}
                    {" · "}
                    {recipe._count.lines} lines
                    {c?.total != null
                      ? ` · ${formatMoney(c.total, currency)} / batch · ${formatMoney(roundCents(c.per ?? 0), currency)} / ${c.label}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/recipes/${recipe.id}`}
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
