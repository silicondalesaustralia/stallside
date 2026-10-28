import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { SECTION_GUIDES } from "@/lib/data-transfer/section-guides";
import NoBusinessYet from "@/components/NoBusinessYet";
import DataSectionCard from "./DataSectionCard";
import ImportForm from "./ImportForm";

export const maxDuration = 300;

export default async function DataManagementPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return <NoBusinessYet />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Data management
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Export {selected.name}&apos;s data as spreadsheets (CSV), or import products, pages,
          subscriptions and customers from a template or another Vendl business.
        </p>
      </div>
      <section className="dash-card flex flex-col gap-3 p-4">
        <div>
          <h2 className="font-semibold text-[var(--field)]">Import from another platform</h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Moving from Shopify, WooCommerce, Squarespace, Wix or Square? Upload their export and
            we&apos;ll match the columns for you. Any other spreadsheet works too.
          </p>
        </div>
        <Link
          href="/dashboard/data/import"
          className="self-start rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          Import data
        </Link>
      </section>
      <section className="dash-card flex flex-col gap-3 p-4">
        <div>
          <h2 className="font-semibold text-[var(--field)]">Everything at once</h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            One ZIP with a CSV for every section below. Importing that ZIP into another business
            copies categories, products, pre-order pages, subscriptions and customers in the right
            order. Orders are included in the export but never imported.
          </p>
        </div>
        <a
          href="/dashboard/data/export/all"
          className="self-start rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--field)]"
        >
          Download everything (ZIP)
        </a>
        <ImportForm section="all" />
      </section>
      <div className="dash-card p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--field)]">How importing works</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Export the section (or download the template) and edit it in Excel, Numbers or Google Sheets.</li>
          <li>Keep the header row. Columns you remove or leave blank keep their current values.</li>
          <li>Save as CSV, choose the file and press Check file. Nothing is saved yet.</li>
          <li>Fix any rows listed, then press Import now.</li>
        </ol>
      </div>
      {SECTION_GUIDES.map((guide) => (
        <DataSectionCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}
