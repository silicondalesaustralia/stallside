import { requireSupplier } from "@/lib/suppliers/access";
import { prisma } from "@/lib/prisma";
import SupplyProductForm from "./SupplyProductForm";
import SupplyStockForm from "./SupplyStockForm";

export default async function SupplyPage({
  searchParams,
}: {
  searchParams: Promise<{ stand?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { membership } = await requireSupplier(params.stand);
  const products = await prisma.product.findMany({
    where: { memberId: membership.id, standId: membership.standId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      isArchived: true,
      description: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Your products
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add what you are putting on {membership.stand.name}. The owner sets
          the price before shoppers can buy it.
        </p>
      </div>
      {params.error ? (
        <p className="text-sm text-red-700">{params.error}</p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {products.map((product) => (
          <li key={product.id} className="dash-card flex flex-col gap-3 p-4">
            <div>
              <p className="font-semibold text-[var(--field)]">{product.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {product.stockQuantity} on hand
                {product.isArchived ? " · Waiting for the owner to publish" : ""}
              </p>
            </div>
            <SupplyStockForm productId={product.id} standId={membership.standId} />
          </li>
        ))}
      </ul>
      <SupplyProductForm standId={membership.standId} />
    </div>
  );
}
