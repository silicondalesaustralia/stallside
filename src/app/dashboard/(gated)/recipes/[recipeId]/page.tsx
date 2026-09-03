import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { toNumber } from "@/lib/production/costing";
import { costRecipe } from "@/lib/production/recipe-cost";
import {
  archiveRecipe,
  duplicateRecipe,
  updateRecipe,
} from "../actions";
import RecipeForm from "../RecipeForm";

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const { recipeId } = await params;
  const sp = await searchParams;

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, ownerId: owner.id },
    include: {
      lines: { orderBy: { sortOrder: "asc" } },
      productLinks: { include: { product: { select: { id: true, name: true } } } },
    },
  });
  if (!recipe) notFound();

  const [ingredients, recipes] = await Promise.all([
    prisma.ingredient.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, baseUnit: true },
    }),
    prisma.recipe.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, yieldLabel: true },
    }),
  ]);

  let cost = null as Awaited<ReturnType<typeof costRecipe>> | null;
  try {
    cost = await costRecipe(owner.id, recipe.id);
  } catch {
    cost = null;
  }

  const currency = owner.billingCurrency || "AUD";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/recipes" className="underline">
            Recipes
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{recipe.name}</h1>
        {sp.saved ? (
          <p className="mt-1 text-sm text-[var(--leaf-dark)]">Saved.</p>
        ) : null}
        {cost ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Ingredient cost {formatMoney(cost.totalCents, currency)} / batch ·{" "}
            {formatMoney(Math.round(cost.costPerYieldUnitCents), currency)} /{" "}
            {cost.yieldLabel}
          </p>
        ) : null}
      </div>

      {cost && cost.lines.length > 0 ? (
        <ul className="text-sm text-[var(--muted)]">
          {cost.lines.map((line, i) => (
            <li key={i}>
              {line.name}: {line.quantity} {line.unitLabel} ·{" "}
              {formatMoney(line.costCents, currency)}
            </li>
          ))}
        </ul>
      ) : null}

      <RecipeForm
        action={updateRecipe}
        ingredients={ingredients}
        recipes={recipes}
        excludeRecipeId={recipe.id}
        defaults={{
          id: recipe.id,
          name: recipe.name,
          yieldQuantity: String(toNumber(recipe.yieldQuantity)),
          yieldLabel: recipe.yieldLabel,
          instructions: recipe.instructions,
          isActive: recipe.isActive,
          lines: recipe.lines.map((line) =>
            line.ingredientId
              ? {
                  kind: "ingredient" as const,
                  ingredientId: line.ingredientId,
                  quantity: String(toNumber(line.quantity)),
                  unit: line.unit ?? "G",
                }
              : {
                  kind: "component" as const,
                  componentRecipeId: line.componentRecipeId ?? "",
                  quantity: String(toNumber(line.quantity)),
                },
          ),
        }}
      />

      {recipe.productLinks.length > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Linked products:{" "}
          {recipe.productLinks.map((l) => l.product.name).join(", ")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm">
        <form action={duplicateRecipe}>
          <input type="hidden" name="id" value={recipe.id} />
          <button type="submit" className="underline text-[var(--leaf-dark)]">
            Duplicate
          </button>
        </form>
        {recipe.isActive ? (
          <form action={archiveRecipe}>
            <input type="hidden" name="id" value={recipe.id} />
            <button type="submit" className="underline text-[var(--muted)]">
              Archive
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
