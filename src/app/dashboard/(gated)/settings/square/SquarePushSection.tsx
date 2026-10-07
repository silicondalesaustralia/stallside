import { listUnlinkedProducts } from "@/lib/square/catalog-push";
import SquarePushPanel from "./SquarePushPanel";

export default async function SquarePushSection({
  ownerId,
  connectionId,
  catalogEnabled,
  stockWillSync,
  currency,
}: {
  ownerId: string;
  connectionId: string;
  catalogEnabled: boolean;
  stockWillSync: boolean;
  currency: string;
}) {
  if (!catalogEnabled) {
    return (
      <p className="text-[var(--muted)]">
        Turn on product / catalogue sync to add Vendl products to Square.
      </p>
    );
  }
  const products = await listUnlinkedProducts(ownerId, connectionId);
  return (
    <SquarePushPanel
      currency={currency}
      stockWillSync={stockWillSync}
      candidates={products.map((p) => ({
        id: p.id,
        name: p.name,
        priceCents: p.priceCents,
        stockQuantity: p.stockQuantity,
        standName: p.stand.name,
      }))}
    />
  );
}
