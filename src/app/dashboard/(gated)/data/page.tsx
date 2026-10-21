import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { SECTION_GUIDES } from "@/lib/data-transfer/section-guides";
import NoBusinessYet from "@/components/NoBusinessYet";
import DataSectionCard from "./DataSectionCard";

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
          Export {selected.name}&apos;s data as spreadsheets (CSV) to keep a backup, share with your
          accountant, or move to another Vendl business.
        </p>
      </div>
      <section className="dash-card flex flex-col gap-3 p-4">
        <div>
          <h2 className="font-semibold text-[var(--field)]">Everything at once</h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            One ZIP with a CSV for every section below: categories, products, pre-order pages,
            subscriptions, customers, orders and order items. Photos are included as links.
          </p>
        </div>
        <a
          href="/dashboard/data/export/all"
          className="self-start rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--field)]"
        >
          Download everything (ZIP)
        </a>
      </section>
      <div className="dash-card p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--field)]">Opening the files</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Download a section, or everything as a ZIP (double-click the ZIP to unpack it).</li>
          <li>Open the CSV in Excel, Numbers or Google Sheets (File → Import in Sheets).</li>
          <li>Prices are in dollars, dates use your business time zone, lists are separated by |.</li>
        </ol>
      </div>
      {SECTION_GUIDES.map((guide) => (
        <DataSectionCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}
