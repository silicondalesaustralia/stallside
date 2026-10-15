import Link from "next/link";

export const PRODUCT_TABS = [
  { id: "standard", label: "Standard products" },
  { id: "preorder", label: "Pre-order products" },
  { id: "draft", label: "Draft" },
  { id: "supplier", label: "Supplier products" },
] as const;

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"];

/** Reads `?tab=`; old `?view=archived` links open Draft. */
export function productTabFrom(tab: string | undefined, view: string | undefined): ProductTabId {
  if (view === "archived" && tab !== "supplier") return "draft";
  return PRODUCT_TABS.some((t) => t.id === tab) ? (tab as ProductTabId) : "standard";
}

export function productsHref(tab: ProductTabId): string {
  return tab === "standard" ? "/dashboard/products" : `/dashboard/products?tab=${tab}`;
}

export default function ProductsTabs({ active }: { active: ProductTabId }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Product lists">
      {PRODUCT_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={productsHref(tab.id)}
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
