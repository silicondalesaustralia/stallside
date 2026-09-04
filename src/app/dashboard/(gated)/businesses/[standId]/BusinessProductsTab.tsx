import Link from "next/link";
import DashPrimaryCta from "@/components/DashPrimaryCta";
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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          What customers can buy on this business&apos;s checkout page.
        </p>
        <DashPrimaryCta href={`/dashboard/products/new?standId=${standId}`}>
          + Add product
        </DashPrimaryCta>
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
                  prefetch={false}
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
                prefetch={false}
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
