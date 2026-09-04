import Link from "next/link";
import DashListCard from "@/components/DashListCard";
import { formatMoney } from "@/lib/money";
import ProductLifecycleActions from "./ProductLifecycleActions";

type ProductRow = {
  id: string;
  name: string;
  isHidden: boolean;
  isArchived: boolean;
  priceCents: number;
  currency: string;
  costCents: number | null;
  stockQuantity: number;
  sku: string | null;
};

export default function ProductListRow({
  product,
}: {
  product: ProductRow;
}) {
  return (
    <li>
      <DashListCard>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {product.sku ? `SKU ${product.sku}` : "Product"}
              {product.isArchived ? " · Archived" : null}
              {product.isHidden && !product.isArchived ? " · Hidden" : null}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold leading-tight">
              {product.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {formatMoney(product.priceCents, product.currency)}
              {product.costCents != null
                ? ` · profit ${formatMoney(product.priceCents - product.costCents, product.currency)}`
                : null}{" "}
              · {product.stockQuantity} in stock
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Link
              href={`/dashboard/products/${product.id}`}
              prefetch={false}
              className="inline-flex justify-center rounded-full bg-[var(--field)] px-4 py-2 text-sm font-bold text-[var(--ink-on-dark)]"
            >
              Edit
            </Link>
            <ProductLifecycleActions
              productId={product.id}
              productName={product.name}
              isHidden={product.isHidden}
              isArchived={product.isArchived}
            />
          </div>
        </div>
      </DashListCard>
    </li>
  );
}
