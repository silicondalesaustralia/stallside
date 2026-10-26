import Link from "next/link";
import NoBusinessYet from "@/components/NoBusinessYet";
import { prisma } from "@/lib/prisma";
import { costRecipe } from "@/lib/production/batch-costing";
import { isLowMaterial, loadCostContext } from "@/lib/production/load-cost-context";
import { loadProductLinks } from "@/lib/production/load-product-links";
import ProductionShell from "./ProductionShell";
import ActionForm from "./ActionForm";
import BatchFields, { type BatchRecipeOption } from "./BatchFields";
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
  const [ctx, links, products, batches] = await Promise.all([
    loadCostContext(scope.ownerId),
    loadProductLinks(scope.ownerId),
    prisma.product.findMany({
      where: { ownerId: scope.ownerId, standId: stand.id, isArchived: false, memberId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.productionBatch.findMany({
      where: { ownerId: scope.ownerId, standId: stand.id },
      orderBy: [{ madeAt: "desc" }, { createdAt: "desc" }],
      take: BATCH_LIST_LIMIT,
      include: { product: { select: { name: true } }, lines: true },
    }),
  ]);

  const recipes: BatchRecipeOption[] = ctx.recipeRows
    .filter((r) => r.isActive)
    .map((r) => {
      const link = links.find((l) => l.recipeId === r.id && l.standId === stand.id);
      return {
        id: r.id,
        name: r.name,
        yieldQuantity: r.yieldQuantity,
        yieldLabel: r.yieldLabel,
        batchCostCents: costRecipe(r.id, ctx).totalCents,
        productId: link?.productId ?? null,
        yieldUnitsPerProduct: link?.yieldUnitsPerProduct ?? null,
      };
    });
  const low = ctx.materials.filter((m) => m.isActive && isLowMaterial(m));

  return (
    <ProductionShell active="batches" subtitle={`Production runs · ${stand.name}`}>
      {low.length > 0 ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Reorder soon:</strong> {low.map((m) => m.name).join(", ")}.{" "}
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
          rows={batches.map((b) => ({
            ...b,
            batchCount: Number(b.batchCount),
            productName: b.product?.name ?? null,
            lines: b.lines.map((l) => ({ ...l, quantity: Number(l.quantity) })),
          }))}
        />
      </section>
    </ProductionShell>
  );
}
