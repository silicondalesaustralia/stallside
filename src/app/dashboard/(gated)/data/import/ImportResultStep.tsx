import Link from "next/link";
import type { ImportEntity } from "@/lib/data-import/fields";
import type { ImportTotals } from "@/lib/data-import/run-import";
import ImportIssueList from "./ImportIssueList";

const NEXT: Record<ImportEntity, { href: string; label: string }> = {
  products: { href: "/dashboard/products", label: "View products" },
  customers: { href: "/dashboard/customers", label: "View customers" },
  inventory: { href: "/dashboard/inventory", label: "View inventory" },
};

export default function ImportResultStep({
  entity,
  totals,
  onAgain,
}: {
  entity: ImportEntity;
  totals: ImportTotals;
  onAgain: () => void;
}) {
  return (
    <section className="dash-card flex flex-col gap-4 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">Import finished</h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">
          {totals.created} added, {totals.updated} updated, {totals.skipped} unchanged or skipped.
        </p>
      </div>
      <ImportIssueList issues={totals.issues} />
      <div className="flex gap-2">
        <Link href={NEXT[entity].href} className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white">
          {NEXT[entity].label}
        </Link>
        <button type="button" onClick={onAgain} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm">
          Import another file
        </button>
      </div>
    </section>
  );
}
