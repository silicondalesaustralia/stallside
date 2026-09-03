import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { centsPerBaseUnit, toNumber } from "@/lib/production/costing";
import { unitLabel, type MeasureUnitCode } from "@/lib/production/units";
import { archiveIngredient, updateIngredient } from "../actions";
import IngredientForm from "../IngredientForm";

export default async function EditIngredientPage({
  params,
  searchParams,
}: {
  params: Promise<{ ingredientId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const { ingredientId } = await params;
  const sp = await searchParams;
  const ing = await prisma.ingredient.findFirst({
    where: { id: ingredientId, ownerId: owner.id },
    include: {
      costHistory: { orderBy: { recordedAt: "desc" }, take: 5 },
    },
  });
  if (!ing) notFound();

  const currency = owner.billingCurrency || "AUD";
  const per = centsPerBaseUnit({
    purchaseQuantity: toNumber(ing.purchaseQuantity),
    purchaseUnit: ing.purchaseUnit as MeasureUnitCode,
    purchasePriceCents: ing.purchasePriceCents,
    baseUnit: ing.baseUnit as MeasureUnitCode,
  });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/ingredients" className="underline">
            Ingredients
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{ing.name}</h1>
        {sp.saved ? (
          <p className="mt-1 text-sm text-[var(--leaf-dark)]">Saved.</p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--muted)]">
          Current cost: {formatMoney(Math.round(per), currency)} /{" "}
          {unitLabel(ing.baseUnit as MeasureUnitCode)}
        </p>
      </div>
      <IngredientForm
        action={updateIngredient}
        defaults={{
          id: ing.id,
          name: ing.name,
          baseUnit: ing.baseUnit,
          purchaseQuantity: String(toNumber(ing.purchaseQuantity)),
          purchaseUnit: ing.purchaseUnit,
          purchasePrice: (ing.purchasePriceCents / 100).toFixed(2),
          supplier: ing.supplier,
          isActive: ing.isActive,
        }}
      />
      {ing.costHistory.length > 0 ? (
        <section className="text-sm">
          <h2 className="font-semibold">Price history</h2>
          <ul className="mt-2 space-y-1 text-[var(--muted)]">
            {ing.costHistory.map((h) => (
              <li key={h.id}>
                {h.recordedAt.toLocaleDateString()} ·{" "}
                {formatMoney(h.purchasePriceCents, currency)} /{" "}
                {toNumber(h.purchaseQuantity)}{" "}
                {unitLabel(h.purchaseUnit as MeasureUnitCode)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {ing.isActive ? (
        <form action={archiveIngredient}>
          <input type="hidden" name="id" value={ing.id} />
          <button type="submit" className="text-sm text-[var(--muted)] underline">
            Archive ingredient
          </button>
        </form>
      ) : null}
    </main>
  );
}
