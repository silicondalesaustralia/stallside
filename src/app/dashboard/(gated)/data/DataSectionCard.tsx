import type { SectionGuide } from "@/lib/data-transfer/section-guides";
import ImportForm from "./ImportForm";

const linkClass =
  "rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--field)] hover:bg-[var(--paper)]";

export default function DataSectionCard({ guide }: { guide: SectionGuide }) {
  const base = `/dashboard/data/export/${guide.id}`;
  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">{guide.title}</h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{guide.summary}</p>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
        {guide.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <a href={base} className={linkClass}>
          Export {guide.id === "orders" ? "orders" : "CSV"}
        </a>
        {guide.id === "orders" ? (
          <a href="/dashboard/data/export/order-items" className={linkClass}>
            Export order items
          </a>
        ) : null}
        {guide.importable ? (
          <a href={`${base}?template=1`} className={linkClass}>
            Download template
          </a>
        ) : null}
      </div>
      {guide.importable ? <ImportForm section={guide.id} /> : null}
    </section>
  );
}
