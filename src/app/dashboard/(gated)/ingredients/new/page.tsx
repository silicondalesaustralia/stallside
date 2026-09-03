import Link from "next/link";
import { createIngredient } from "../actions";
import IngredientForm from "../IngredientForm";

export default function NewIngredientPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/ingredients" className="underline">
            Ingredients
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Add ingredient
        </h1>
      </div>
      <IngredientForm action={createIngredient} />
    </main>
  );
}
