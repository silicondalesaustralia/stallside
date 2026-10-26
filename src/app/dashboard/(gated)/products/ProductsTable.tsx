/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import { stockStatusFor, supplyStatusLabel } from "@/lib/inventory/inventory-status";
import type { StandProductRow } from "@/lib/products/list";
import ProductLifecycleActions from "./ProductLifecycleActions";

export type ProductsTableRow = StandProductRow & {
  ownerUnits: number | null;
  supplierUnits: number | null;
};

const COLUMNS: DataColumn[] = [
  { label: "Product" },
  { label: "Status" },
  { label: "Inventory", hideBelow: "sm" },
  { label: "Price", align: "right" },
  { label: "Profit", align: "right", hideBelow: "md" },
  { label: "", hideBelow: "lg" },
];

function statusPill(p: ProductsTableRow): PillSpec {
  if (p.isArchived) return { label: "Draft", tone: "neutral" };
  if (p.isHidden) return { label: "Hidden", tone: "warning" };
  return { label: "Active", tone: "success" };
}

function Inventory({ p }: { p: ProductsTableRow }) {
  const status = stockStatusFor(p.stockQuantity, p.lowStockThreshold);
  const tone =
    status === "out" ? "text-[var(--gone)]" : status === "low" ? "text-[var(--warn)]" : "";
  const supply = supplyStatusLabel(p.supplyStatus);
  const split = p.supplierUnits != null && p.supplierUnits > 0 && p.ownerUnits != null;
  return (
    <div className="whitespace-nowrap">
      <span className={tone}>
        {status === "out" ? "Out of stock" : `${p.stockQuantity} in stock`}
      </span>
      {supply ? <span className="text-[var(--muted)]"> · {supply}</span> : null}
      {split ? (
        <p className="text-xs text-[var(--muted)]">
          {p.ownerUnits} yours · {p.supplierUnits} supplier
        </p>
      ) : null}
    </div>
  );
}

export default function ProductsTable({ products }: { products: ProductsTableRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${products.length} product${products.length === 1 ? "" : "s"}`}>
      {products.map((p) => {
        const href = `/dashboard/products/${p.id}`;
        return (
          <DataTableRow key={p.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <div className="flex items-center gap-3">
                <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--wash)]">
                  {p.imageUrl ? <img src={p.imageUrl} alt="" className="size-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <Link href={href} prefetch={false} className="font-semibold hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {[p.sku ? `SKU ${p.sku}` : null, p.member ? `Supplier · ${p.member.name}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...statusPill(p)} />
            </td>
            <td className={cellClass(COLUMNS[2])}>
              <Inventory p={p} />
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>
              {formatMoney(p.priceCents, p.currency)}
            </td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap text-[var(--muted)]`}>
              {p.costCents != null ? formatMoney(p.priceCents - p.costCents, p.currency) : "—"}
            </td>
            <td className={cellClass(COLUMNS[5])}>
              <ProductLifecycleActions
                productId={p.id}
                productName={p.name}
                isArchived={p.isArchived}
                isSupplier={p.member != null}
                compact
              />
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
