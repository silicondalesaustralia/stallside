import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import ProductDeleteButton from "./ProductDeleteButton";

export default async function ProductsPage() {
  const { owner } = await requireOwner();
  const products = await prisma.product.findMany({
    where: { ownerId: owner.id, isActive: true },
    include: { stand: true },
    orderBy: [{ standId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-[var(--muted)]">
            Name products as you sell them - e.g. Dozen eggs, 500g steak.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No products yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {product.stand.name} ·{" "}
                  {formatMoney(product.priceCents, product.currency)} ·{" "}
                  {product.stockQuantity} in stock
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="text-[var(--leaf-dark)] underline"
                >
                  Edit
                </Link>
                <Link
                  href="/dashboard/inventory"
                  className="text-[var(--leaf-dark)] underline"
                >
                  Adjust stock
                </Link>
                <ProductDeleteButton productId={product.id} productName={product.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
