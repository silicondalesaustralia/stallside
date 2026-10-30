import Link from "next/link";
import NoBusinessYet from "@/components/NoBusinessYet";
import { loadBatchFormData } from "@/lib/production/batch-form-data";
import ProductionShell from "./ProductionShell";
import ActionForm from "./ActionForm";
import BatchFields from "./BatchFields";
import BatchList, { BATCH_LIST_LIMIT } from "./BatchList";
import { cardClass } from "./form-styles";
import { loadProductionScope } from "./production-scope";
import { createBatch } from "./batch-actions";

export default async function ProductionPage({ searchParams }: { searchParams: Promise<{ recipe?: string }> }) {
  const { recipe: initialRecipeId } = await searchParams;
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="batches" subtitle="Production runs">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const stand = scope.stand;
  const { recipes, products, lowMaterials, batches } = await loadBatchFormData(
    scope.ownerId,
    stand.id,
    BATCH_LIST_LIMIT,
  );

  return (
    <ProductionShell active="batches" subtitle={`Production runs · ${stand.name}`}>
      {lowMaterials.length > 0 ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Reorder soon:</strong> {lowMaterials.join(", ")}.{" "}
          <Link href="/dashboard/production/materials" className="underline">Materials</Link>
        </p>
      ) : null}

      {recipes.length > 0 ? (
        <section className={cardClass}>
          <h2 className="font-semibold">Record a batch</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Takes the recipe&apos;s materials out of stock, adds the finished units to your product, and saves what the
            batch cost.
          </p>
          <ActionForm action={createBatch} submitLabel="Record batch" className="mt-3 flex flex-col gap-3">
            <BatchFields
              recipes={recipes}
              products={products}
              initialRecipeId={initialRecipeId}
              today={scope.today}
              currency={stand.currency}
            />
          </ActionForm>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">
          Start by adding your <Link href="/dashboard/production/materials" className="underline">materials</Link>{" "}
          (ingredients or parts), then build a <Link href="/dashboard/production/recipes" className="underline">recipe</Link>{" "}
          for each product. Then you can record batches here.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Recent batches</h2>
        <BatchList
          currency={stand.currency}
          timeZone={stand.timezone}
          rows={batches}
        />
      </section>
    </ProductionShell>
  );
}
