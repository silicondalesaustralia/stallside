import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createRecipe } from "../actions";
import RecipeForm from "../RecipeForm";

export default async function NewRecipePage() {
  const { owner } = await requireOwner();
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/recipes" className="underline">
            Recipes
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">New recipe</h1>
      </div>
      <RecipeForm
        action={createRecipe}
        ingredients={ingredients}
        recipes={recipes}
      />
    </main>
  );
}
