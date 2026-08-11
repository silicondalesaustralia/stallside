import Link from "next/link";

export const PRODUCT_TABS = [
  { id: "standard", label: "Standard" },
  { id: "preorder", label: "Pre Order" },
] as const;

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"];

export function isProductTabId(value: string | undefined): value is ProductTabId {
  return PRODUCT_TABS.some((t) => t.id === value);
}

export default function ProductsTabs({
  active,
  view,
}: {
  active: ProductTabId;
  view?: string;
}) {
  const archived = view === "archived";
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)]"
      aria-label="Product type"
    >
      {PRODUCT_TABS.map((tab) => {
        const selected = tab.id === active;
        const params = new URLSearchParams();
        if (tab.id !== "standard") params.set("tab", tab.id);
        if (archived) params.set("view", "archived");
        const qs = params.toString();
        return (
          <Link
            key={tab.id}
            href={qs ? `/dashboard/products?${qs}` : "/dashboard/products"}
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
