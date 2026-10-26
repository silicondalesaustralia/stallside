import NoBusinessYet from "@/components/NoBusinessYet";
import { isLowMaterial, loadCostContext } from "@/lib/production/load-cost-context";
import ProductionShell from "../ProductionShell";
import ActionForm from "../ActionForm";
import { cardClass } from "../form-styles";
import { loadProductionScope } from "../production-scope";
import MaterialsTable from "./MaterialsTable";
import MaterialsTabs, { materialTabFrom } from "./MaterialsTabs";
import MaterialFields from "./MaterialFields";
import PurchaseFields from "./PurchaseFields";
import { saveMaterial } from "./material-actions";
import { recordPurchase } from "./purchase-actions";
import ScanInvoicePanel from "./scan/ScanInvoicePanel";

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = materialTabFrom((await searchParams).tab);
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
  const packaging = materials.filter((m) => m.kind === "PACKAGING");
  const shown = tab === "all" ? materials : tab === "packaging" ? packaging : materials.filter((m) => m.kind === "INGREDIENT");
  const counts = { all: materials.length, ingredients: materials.length - packaging.length, packaging: packaging.length };

  return (
    <ProductionShell
      active="materials"
      subtitle={`Ingredients, parts and packaging · ${active.length} active${lowCount ? ` · ${lowCount} to reorder` : ""}`}
    >
      <ScanInvoicePanel
        materials={active.map((m) => ({ id: m.id, name: m.name, baseUnit: m.baseUnit }))}
        currency={scope.stand.currency}
      />

      {active.length > 0 ? (
        <details className={cardClass}>
          <summary className="cursor-pointer font-semibold">Record incoming supplies by hand</summary>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Adds to stock on hand and becomes the material&apos;s current cost for recipes.
          </p>
          <ActionForm action={recordPurchase} submitLabel="Record purchase" resetOnSuccess className="mt-3 flex flex-col gap-3">
            <PurchaseFields materials={active.map((m) => ({ id: m.id, name: m.name }))} today={scope.today} />
          </ActionForm>
        </details>
      ) : null}

      {materials.length > 0 ? <MaterialsTabs active={tab} counts={counts} /> : null}
      <MaterialsTable rows={shown} currency={scope.stand.currency} />

      <details className={cardClass} open={materials.length === 0}>
        <summary className="cursor-pointer font-semibold">Add a material</summary>
        <ActionForm action={saveMaterial} submitLabel="Add material" className="mt-3 flex flex-col gap-3">
          <MaterialFields defaultKind={tab === "packaging" ? "PACKAGING" : "INGREDIENT"} />
        </ActionForm>
      </details>
    </ProductionShell>
  );
}
