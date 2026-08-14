import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CollectionPageCard from "./CollectionPageCard";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { groupCollectionPages } from "./group-collection-pages";
import {
  loadCollectionOrders,
  toCollectionOrderView,
} from "./load-collections";
import { loadStandPreOrderPages } from "./load-preorder-pages";
import { loadStandSubscriptionOffers } from "./load-subscription-offers";

export default async function CollectionsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
        </div>
        <NoBusinessYet />
      </main>
    );
  }

  const [rawOrders, pages, offers, standBrand] = await Promise.all([
    loadCollectionOrders(owner.id, selected.id),
    loadStandPreOrderPages(owner.id, selected.id),
    loadStandSubscriptionOffers(owner.id, selected.id),
    prisma.stand.findFirst({
      where: { id: selected.id, ownerId: owner.id },
      select: { name: true, logoUrl: true },
    }),
  ]);
  const orders = rawOrders.map(toCollectionOrderView);
  const groups = groupCollectionPages(orders, pages, offers);
  const brand = {
    name: standBrand?.name ?? selected.name,
    logoUrl: standBrand?.logoUrl ?? null,
  };

  return (
    <main className="flex flex-col gap-8">
      <div className="collections-screen-only">
        <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
        <p className="mt-1 text-[var(--muted)]">
          {selected.name} — one container per pre-order page or subscription.
          Open to pack, email, and print.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="collections-screen-only text-[var(--muted)]">
          No paid pre-orders or subscription cycles upcoming or in the last 14
          days.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group, index) => (
            <CollectionPageCard
              key={group.key}
              group={group}
              brand={brand}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
