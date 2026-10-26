import Link from "next/link";
import SortableOrderList from "@/components/SortableOrderList";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { OwnerCategoryRow } from "@/lib/categories/load";
import { saveCategoryOrder } from "./actions";

/** Arrange the order categories appear in the shop menu. */
export default function CategoryMenuOrder({ categories }: { categories: OwnerCategoryRow[] }) {
  const items = categories.map((c) => ({
    id: c.id,
    label: c.title,
    href: `/dashboard/categories/${c.id}`,
    detail: [
      `${c._count.products} product${c._count.products === 1 ? "" : "s"}`,
      c.isActive && !c.showOnWebsite ? "Hidden from shop menu" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    badge: c.isActive ? (
      <StatusPill label="Published" tone="success" />
    ) : (
      <StatusPill label="Unpublished" tone="neutral" />
    ),
  }));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">Order of categories in your shop menu.</p>
        <Link href="/dashboard/categories" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
          Done
        </Link>
      </div>
      <SortableOrderList
        key={items.map((i) => i.id).join()}
        items={items}
        onSave={saveCategoryOrder}
        emptyText="No categories yet. Add your first one above."
      />
    </section>
  );
}
