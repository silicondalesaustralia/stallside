import Link from "next/link";

export const BUSINESS_TABS = [
  { id: "details", label: "Business Details" },
  { id: "payments", label: "Checkout payments" },
  { id: "branding", label: "Branding" },
] as const;

/** Tabs that moved to their own dashboard pages; old links redirect there. */
export const MOVED_BUSINESS_TABS: Record<string, string> = {
  products: "/dashboard/products",
  upsells: "/dashboard/upsells",
};

export type BusinessTabId = (typeof BUSINESS_TABS)[number]["id"];

export function isBusinessTabId(value: string | undefined): value is BusinessTabId {
  return BUSINESS_TABS.some((t) => t.id === value);
}

export default function BusinessSetupTabs({
  standId,
  active,
  hideBranding = false,
}: {
  standId: string;
  active: BusinessTabId;
  hideBranding?: boolean;
}) {
  const tabs = hideBranding ? BUSINESS_TABS.filter((t) => t.id !== "branding") : BUSINESS_TABS;
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)]"
      aria-label="Business setup"
    >
      {tabs.map((tab) => {
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
