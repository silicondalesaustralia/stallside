import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { productCatalogWhere } from "@/lib/product-visibility";
import SortableOrderList from "@/components/SortableOrderList";
import { saveProductOrder } from "./product-order-actions";

/** Arrange Product.sortOrder in the same set/order the public shop uses. */
export default async function ProductShopOrder({
  ownerId,
  standId,
}: {
  ownerId: string;
  standId: string;
}) {
  const products = await prisma.product.findMany({
    where: { ownerId, standId, ...productCatalogWhere },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, sku: true, preOrderEligible: true, memberId: true },
  });
  const items = products.map((p) => ({
    id: p.id,
    label: p.name,
    href: `/dashboard/products/${p.id}`,
    detail: [
      p.sku ? `SKU ${p.sku}` : null,
      p.preOrderEligible ? "Pre-order" : null,
      p.memberId ? "Supplier" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">
          Order of products on your main shop page. Each category has its own order under{" "}
          <Link href="/dashboard/categories" className="font-semibold text-[var(--leaf-dark)] underline">
            Categories
          </Link>
          .
        </p>
        <Link href="/dashboard/products" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
          Done
        </Link>
      </div>
      <SortableOrderList
        key={items.map((i) => i.id).join()}
        items={items}
        onSave={saveProductOrder}
        emptyText="No products on your shop yet."
      />
    </section>
  );
}
