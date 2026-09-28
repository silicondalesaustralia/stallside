import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import {
  filterInventoryRows,
  loadInventoryReport,
} from "@/lib/inventory/load-inventory-report";
import { INVENTORY_FILTERS } from "@/lib/inventory/inventory-status";
import ProductsTabs from "../products/ProductsTabs";
import InventorySummaryTiles from "./InventorySummaryTiles";
import InventoryReportTable from "./InventoryReportTable";
import InventoryCountForm from "./InventoryCountForm";
import InventoryImportPanel from "./InventoryImportPanel";
import { inventoryHref, inventoryQuery, pillClass } from "./inventory-href";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; mode?: string }>;
}) {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = INVENTORY_FILTERS.some((f) => f.id === params.status)
    ? params.status
    : undefined;
  const isCount = params.mode === "count";
  const isImport = params.mode === "import";
  const base = { status, q: q || undefined };

  const heading = (
    <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
      Inventory
    </h1>
  );
  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        {heading}
        <NoBusinessYet />
      </main>
    );
  }

  const allRows = await loadInventoryReport({ ownerId: owner.id, standId: selected.id, q });
  const rows = filterInventoryRows(allRows, status);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {heading}
          <p className="mt-1 text-[var(--muted)]">
            {isCount ? "Stock count" : isImport ? "Import stock" : "Stock report"} · {selected.name}
            {q ? ` · “${q}”` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={inventoryHref({ ...base, mode: isCount ? undefined : "count" })} className={pillClass(isCount)}>
            {isCount ? "Exit stock count" : "Start stock count"}
          </Link>
          <a href={`/dashboard/inventory/export${inventoryQuery(base)}`} download className={pillClass(false)}>
            Export CSV
          </a>
          <Link href={inventoryHref({ ...base, mode: isImport ? undefined : "import" })} className={pillClass(isImport)}>
            {isImport ? "Close import" : "Import CSV"}
          </Link>
        </div>
      </div>

      <ProductsTabs active="inventory" />

      {isImport ? <InventoryImportPanel /> : null}

      <form method="get" role="search" className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        {isCount ? <input type="hidden" name="mode" value="count" /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, SKU, or barcode"
          autoComplete="off"
          aria-label="Search inventory"
          className="min-w-[12rem] flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <button type="submit" className="rounded-lg bg-[var(--field)] px-3.5 py-2 text-sm font-semibold text-[var(--ink-on-dark)]">
          Search
        </button>
      </form>

      {!isCount ? <InventorySummaryTiles rows={allRows} /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={inventoryHref({ ...base, status: undefined, mode: params.mode })} className={pillClass(!status)}>
          All ({allRows.length})
        </Link>
        {INVENTORY_FILTERS.map((f) => {
          const count = filterInventoryRows(allRows, f.id).length;
          if (count === 0 && status !== f.id) return null;
          return (
            <Link key={f.id} href={inventoryHref({ ...base, status: f.id, mode: params.mode })} className={pillClass(status === f.id)}>
              {f.label} ({count})
            </Link>
          );
        })}
      </div>

      {isCount ? (
        <InventoryCountForm
          rows={rows.map((r) => ({ id: r.id, name: r.name, sku: r.sku, stockQuantity: r.stockQuantity }))}
        />
      ) : (
        <InventoryReportTable rows={rows} />
      )}
    </main>
  );
}
