import Link from "next/link";

export const MATERIAL_TABS = [
  { id: "all", label: "All" },
  { id: "ingredients", label: "Ingredients" },
  { id: "packaging", label: "Packaging" },
] as const;

export type MaterialTabId = (typeof MATERIAL_TABS)[number]["id"];

export function materialTabFrom(tab: string | undefined): MaterialTabId {
  return MATERIAL_TABS.some((t) => t.id === tab) ? (tab as MaterialTabId) : "all";
}

export default function MaterialsTabs({ active, counts }: { active: MaterialTabId; counts: Record<MaterialTabId, number> }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Material lists">
      {MATERIAL_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.id === "all" ? "/dashboard/production/materials" : `/dashboard/production/materials?tab=${tab.id}`}
          aria-current={tab.id === active ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            tab.id === active
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]"
          }`}
        >
          {tab.label} <span className="font-normal opacity-70">{counts[tab.id]}</span>
        </Link>
      ))}
    </nav>
  );
}
