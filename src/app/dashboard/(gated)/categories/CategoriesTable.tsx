import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { OwnerCategoryRow } from "@/lib/categories/load";
import CategoryRowActions from "./CategoryRowActions";
import { deleteCategory, setCategoryActive } from "./actions";

const COLUMNS: DataColumn[] = [
  { label: "Category" },
  { label: "Status" },
  { label: "Products", align: "right", hideBelow: "sm" },
  { label: "", align: "right" },
];

export default function CategoriesTable({ categories }: { categories: OwnerCategoryRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}>
      {categories.map((c) => {
        const href = `/dashboard/categories/${c.id}`;
        return (
          <DataTableRow key={c.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {c.title}
              </Link>
              {c.isActive && !c.showOnWebsite ? (
                <p className="text-xs text-[var(--muted)]">Hidden from shop menu</p>
              ) : null}
            </td>
            <td className={cellClass(COLUMNS[1])}>
              {c.isActive ? (
                <StatusPill label="Published" tone="success" />
              ) : (
                <StatusPill label="Unpublished" tone="neutral" />
              )}
            </td>
            <td className={`${cellClass(COLUMNS[2])} font-receipt whitespace-nowrap`}>{c._count.products}</td>
            <td className={cellClass(COLUMNS[3])}>
              <CategoryRowActions
                title={c.title}
                isActive={c.isActive}
                toggleAction={setCategoryActive.bind(null, c.id, !c.isActive, "list")}
                deleteAction={deleteCategory.bind(null, c.id)}
              />
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
