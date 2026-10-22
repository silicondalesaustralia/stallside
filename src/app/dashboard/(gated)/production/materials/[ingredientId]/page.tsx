import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ingredientCostPerBase } from "@/lib/production/batch-costing";
import { formatUnitCost } from "@/lib/production/format";
import { isLowMaterial, loadCostContext } from "@/lib/production/load-cost-context";
import { formatQuantity } from "@/lib/production/unit-convert";
import NoBusinessYet from "@/components/NoBusinessYet";
import ProductionShell from "../../ProductionShell";
import ActionForm from "../../ActionForm";
import { cardClass } from "../../form-styles";
import { loadProductionScope } from "../../production-scope";
import MaterialFields from "../MaterialFields";
import PurchaseFields from "../PurchaseFields";
import PurchaseHistory from "./PurchaseHistory";
import { saveMaterial, setMaterialActive } from "../material-actions";
import { recordPurchase } from "../purchase-actions";

export default async function MaterialPage({ params }: { params: Promise<{ ingredientId: string }> }) {
  const { ingredientId } = await params;
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="materials" subtitle="Material">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const ctx = await loadCostContext(scope.ownerId);
  const material = ctx.materials.find((m) => m.id === ingredientId);
  if (!material) notFound();

  const purchases = await prisma.ingredientPurchase.findMany({
    where: { ingredientId },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });
  const usedIn = ctx.recipeRows.filter((r) => r.lines.some((l) => l.ingredientId === ingredientId));
  const currency = scope.stand.currency;

  return (
    <ProductionShell
      active="materials"
      subtitle={`${material.name} · ${formatQuantity(material.onHand, material.baseUnit)} on hand · ${formatUnitCost(ingredientCostPerBase(material), material.baseUnit, currency)}`}
      actions={
        <ActionForm action={setMaterialActive} submitLabel={material.isActive ? "Archive" : "Restore"} variant="secondary">
          <input type="hidden" name="id" value={material.id} />
          <input type="hidden" name="isActive" value={material.isActive ? "false" : "true"} />
        </ActionForm>
      }
    >
      <Link href="/dashboard/production/materials" className="text-sm text-[var(--leaf-dark)] underline">
        ← All materials
      </Link>
      {isLowMaterial(material) ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          Stock is at or below the reorder level.
        </p>
      ) : null}

      <section className={cardClass}>
        <h2 className="font-semibold">Record incoming supplies</h2>
        <ActionForm action={recordPurchase} submitLabel="Record purchase" resetOnSuccess className="mt-3 flex flex-col gap-3">
          <PurchaseFields materials={[{ id: material.id, name: material.name }]} today={scope.today} />
        </ActionForm>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Purchase history</h2>
        <PurchaseHistory
          currency={currency}
          rows={purchases.map((p) => ({ ...p, quantity: Number(p.quantity) }))}
        />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">Details</h2>
        <ActionForm action={saveMaterial} submitLabel="Save" className="mt-3 flex flex-col gap-3">
          <MaterialFields material={material} />
        </ActionForm>
      </section>

      {usedIn.length > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Used in:{" "}
          {usedIn.map((r, i) => (
            <span key={r.id}>
              {i > 0 ? ", " : ""}
              <Link href={`/dashboard/production/recipes/${r.id}`} className="underline">
                {r.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </ProductionShell>
  );
}
