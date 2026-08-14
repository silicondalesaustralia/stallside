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
    <nav className="flex flex-wrap gap-2" aria-label="Product type">
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
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              selected
                ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                : "bg-white text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
