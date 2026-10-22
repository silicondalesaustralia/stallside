import NoBusinessYet from "@/components/NoBusinessYet";
import { isLowMaterial, loadCostContext } from "@/lib/production/load-cost-context";
import ProductionShell from "../ProductionShell";
import ActionForm from "../ActionForm";
import { cardClass } from "../form-styles";
import { loadProductionScope } from "../production-scope";
import MaterialsTable from "./MaterialsTable";
import MaterialFields from "./MaterialFields";
import PurchaseFields from "./PurchaseFields";
import { saveMaterial } from "./material-actions";
import { recordPurchase } from "./purchase-actions";

export default async function MaterialsPage() {
  const scope = await loadProductionScope();
  if (!scope.stand) {
    return (
      <ProductionShell active="materials" subtitle="Ingredients and parts">
        <NoBusinessYet />
      </ProductionShell>
    );
  }
  const { materials } = await loadCostContext(scope.ownerId);
  const active = materials.filter((m) => m.isActive);
  const lowCount = active.filter(isLowMaterial).length;

  return (
    <ProductionShell
      active="materials"
      subtitle={`Ingredients and parts · ${active.length} active${lowCount ? ` · ${lowCount} to reorder` : ""}`}
    >
      {active.length > 0 ? (
        <details className={cardClass} open>
          <summary className="cursor-pointer font-semibold">Record incoming supplies</summary>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Adds to stock on hand and becomes the material&apos;s current cost for recipes.
          </p>
          <ActionForm action={recordPurchase} submitLabel="Record purchase" resetOnSuccess className="mt-3 flex flex-col gap-3">
            <PurchaseFields materials={active.map((m) => ({ id: m.id, name: m.name }))} today={scope.today} />
          </ActionForm>
        </details>
      ) : null}

      <MaterialsTable rows={materials} currency={scope.stand.currency} />

      <details className={cardClass} open={materials.length === 0}>
        <summary className="cursor-pointer font-semibold">Add a material</summary>
        <ActionForm action={saveMaterial} submitLabel="Add material" className="mt-3 flex flex-col gap-3">
          <MaterialFields />
        </ActionForm>
      </details>
    </ProductionShell>
  );
}
