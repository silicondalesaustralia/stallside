import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import InventoryAdjustForm from "./InventoryAdjustForm";

export default async function InventoryPage() {
  const { owner } = await requireOwner();
  const products = await prisma.product.findMany({
    where: { ownerId: owner.id, isActive: true },
    include: { stand: true },
    orderBy: [{ stand: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-[var(--muted)]">
          Restock, correct counts, or log cash sales made without QR.
        </p>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Add products first.</p>
      ) : (
        <ul className="space-y-6">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-[var(--muted)]">{product.stand.name}</p>
                </div>
                <p className="text-lg font-semibold">{product.stockQuantity} in stock</p>
              </div>
              <div className="mt-4">
                <InventoryAdjustForm productId={product.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
