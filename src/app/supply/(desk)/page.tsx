import { requireSupplier } from "@/lib/suppliers/access";
import { prisma } from "@/lib/prisma";
import SupplyProductForm from "./SupplyProductForm";
import SupplyStockForm from "./SupplyStockForm";
import SupplyDeleteProductButton from "./SupplyDeleteProductButton";

export default async function SupplyPage({
  searchParams,
}: {
  searchParams: Promise<{ stand?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { membership } = await requireSupplier(params.stand);

  const [linked, owned] = await Promise.all([
    prisma.supplierProductAccess.findMany({
      where: { memberId: membership.id },
      include: {
        product: {
          select: { id: true, name: true, stockQuantity: true },
        },
      },
      orderBy: { product: { name: "asc" } },
    }),
    prisma.product.findMany({
      where: {
        memberId: membership.id,
        standId: membership.standId,
        isArchived: false,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        isArchived: true,
      },
    }),
  ]);

  const lotOnHand = await prisma.stockLot.groupBy({
    by: ["productId"],
    where: {
      memberId: membership.id,
      status: "ACTIVE",
      quantityRemaining: { gt: 0 },
    },
    _sum: { quantityRemaining: true },
  });
  const myUnits = new Map(
    lotOnHand.map((row) => [row.productId, row._sum.quantityRemaining ?? 0]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Your stock
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          On {membership.stand.name}. The owner sets what they owe you per unit.
        </p>
      </div>
      {params.error ? (
        <p className="text-sm text-red-700">{params.error}</p>
      ) : null}

      {linked.length === 0 && owned.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nothing linked yet. Ask the stand owner to link a product under
          Suppliers.
        </p>
      ) : null}

      {linked.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-semibold text-[var(--field)]">
              You have approval to add these products
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              These are the owner’s products. Add your units into their stock.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {linked.map((row) => (
              <li key={row.id} className="dash-card flex flex-col gap-3 p-4">
                <div>
                  <p className="font-semibold text-[var(--field)]">
                    {row.product.name}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Stand has {row.product.stockQuantity} · Your units on hand{" "}
                    {myUnits.get(row.productId) ?? 0}
                    {row.autoApprove
                      ? ""
                      : " · New adds need the owner to approve"}
                  </p>
                </div>
                <SupplyStockForm
                  productId={row.productId}
                  standId={membership.standId}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {owned.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-semibold text-[var(--field)]">
              Your separate products
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              These are only yours until the owner publishes them.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {owned.map((product) => (
              <li key={product.id} className="dash-card flex flex-col gap-3 p-4">
                <div>
                  <p className="font-semibold text-[var(--field)]">
                    {product.name}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {product.stockQuantity} on hand
                    {product.isArchived
                      ? " · Waiting for the owner to publish"
                      : ""}
                  </p>
                </div>
                <SupplyStockForm
                  productId={product.id}
                  standId={membership.standId}
                />
                <SupplyDeleteProductButton
                  standId={membership.standId}
                  productId={product.id}
                  productName={product.name}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="dash-card p-4">
        <summary className="cursor-pointer font-semibold text-[var(--field)]">
          Add a separate product instead
        </summary>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use this only when it should not share stock with one of the owner’s
          products.
        </p>
        <div className="mt-3">
          <SupplyProductForm standId={membership.standId} />
        </div>
      </details>
    </div>
  );
}
