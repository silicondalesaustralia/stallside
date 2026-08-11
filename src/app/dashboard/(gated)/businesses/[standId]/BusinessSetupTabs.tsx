import Link from "next/link";

export const BUSINESS_TABS = [
  { id: "details", label: "Business Details" },
  { id: "payments", label: "Checkout payments" },
  { id: "branding", label: "Branding" },
  { id: "products", label: "Products" },
  { id: "upsells", label: "Upsells" },
] as const;

export type BusinessTabId = (typeof BUSINESS_TABS)[number]["id"];

export function isBusinessTabId(value: string | undefined): value is BusinessTabId {
  return BUSINESS_TABS.some((t) => t.id === value);
}

export default function BusinessSetupTabs({
  standId,
  active,
}: {
  standId: string;
  active: BusinessTabId;
}) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)]"
      aria-label="Business setup"
    >
      {BUSINESS_TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={`/dashboard/businesses/${standId}?tab=${tab.id}`}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              selected
                ? "border-[var(--leaf)] text-[var(--field)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
