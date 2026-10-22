import Link from "next/link";

const TABS = [
  { id: "batches", label: "Batches", href: "/dashboard/production" },
  { id: "materials", label: "Materials", href: "/dashboard/production/materials" },
  { id: "recipes", label: "Recipes", href: "/dashboard/production/recipes" },
  { id: "profit", label: "Profit & loss", href: "/dashboard/production/profit" },
] as const;

export type ProductionTab = (typeof TABS)[number]["id"];

export default function ProductionShell({
  active,
  subtitle,
  actions,
  children,
}: {
  active: ProductionTab;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const tabClass = (selected: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold ${
      selected
        ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
        : "bg-white text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]"
    }`;
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Production
          </h1>
          <p className="mt-1 text-[var(--muted)]">{subtitle}</p>
        </div>
        {actions}
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Production sections">
        {TABS.map((tab) => (
          <Link key={tab.id} href={tab.href} className={tabClass(tab.id === active)}>
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
