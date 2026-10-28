import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import ImportWizard from "./ImportWizard";

export default async function DataImportPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return <NoBusinessYet />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/data" className="underline">
            Data management
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Import data
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Bring products (with variants and stock), customers and stock levels into {selected.name}{" "}
          from Shopify, WooCommerce, Squarespace, Wix, Square or any spreadsheet.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
