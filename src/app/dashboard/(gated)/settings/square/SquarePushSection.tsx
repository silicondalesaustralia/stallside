import { countUnlinkedOtherCurrency, listUnlinkedProducts } from "@/lib/square/catalog-push";
import { pruneDeletedSquareLinks } from "@/lib/square/catalog-prune";
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
  try {
    await pruneDeletedSquareLinks(connectionId);
  } catch (error) {
    console.error("Could not check Square for deleted items", error);
  }
  const [products, otherCurrencyCount] = await Promise.all([
    listUnlinkedProducts(ownerId, connectionId),
    countUnlinkedOtherCurrency(ownerId, connectionId),
  ]);
  return (
    <SquarePushPanel
      currency={currency}
      stockWillSync={stockWillSync}
      otherCurrencyCount={otherCurrencyCount}
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
