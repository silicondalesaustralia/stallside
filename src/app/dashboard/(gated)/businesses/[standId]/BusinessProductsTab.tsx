import Link from "next/link";
import { formatMoney } from "@/lib/money";

type ProductRow = {
  id: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
  currency: string;
};

export default function BusinessProductsTab({
  standId,
  products,
  currency,
}: {
  standId: string;
  products: Omit<ProductRow, "currency">[];
  currency: string;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          What customers can buy on this business&apos;s checkout page.
        </p>
        <Link
          href={`/dashboard/products/new?standId=${standId}`}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Add product
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No products yet. Add your first one to go live.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <Link
                  href={`/dashboard/products/${p.id}`}
                  className="font-medium text-[var(--ink)] hover:underline"
                >
                  {p.name}
                </Link>
                <p className="mt-0.5 text-[var(--muted)]">
                  {formatMoney(p.priceCents, currency)} · {p.stockQuantity} left
                </p>
              </div>
              <Link
                href={`/dashboard/products/${p.id}`}
                className="text-[var(--leaf-dark)] underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
