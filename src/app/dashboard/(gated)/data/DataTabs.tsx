import Link from "next/link";

export const DATA_TABS = [
  { id: "transfer", label: "Import & export" },
  { id: "library", label: "Photo library" },
] as const;

export type DataTabId = (typeof DATA_TABS)[number]["id"];

export function dataTabFrom(tab: string | undefined): DataTabId {
  return tab === "library" ? "library" : "transfer";
}

export function dataHref(tab: DataTabId): string {
  return tab === "transfer" ? "/dashboard/data" : `/dashboard/data?tab=${tab}`;
}

export default function DataTabs({ active }: { active: DataTabId }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Data management">
      {DATA_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={dataHref(tab.id)}
          aria-current={tab.id === active ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            tab.id === active
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
