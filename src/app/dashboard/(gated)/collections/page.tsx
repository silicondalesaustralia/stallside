import { requireOwner } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import CollectionDaySection from "./CollectionDaySection";
import CollectionsPrintControls from "./CollectionsPrintControls";
import MakeListSection from "./MakeListSection";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { buildCollectionsPrintPayload } from "./build-print-payload";
import {
  dayMakeListMeta,
  loadCollectionOrders,
} from "./load-collections";

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

  const [orders, standBrand] = await Promise.all([
    loadCollectionOrders(owner.id, selected.id),
    prisma.stand.findFirst({
      where: { id: selected.id, ownerId: owner.id },
      select: { name: true, logoUrl: true },
    }),
  ]);
  const { days, printDays, labelOrders } = buildCollectionsPrintPayload(orders);
  const brand = {
    name: standBrand?.name ?? selected.name,
    logoUrl: standBrand?.logoUrl ?? null,
  };

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="collections-screen-only">
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-[var(--muted)]">
            {selected.name} - make list first, then pack by customer.
          </p>
        </div>
        {days.length > 0 ? (
          <CollectionsPrintControls
            days={printDays}
            labelOrders={labelOrders}
            brand={brand}
          />
        ) : null}
      </div>

      {days.length === 0 ? (
        <p className="collections-screen-only text-[var(--muted)]">
          No paid pre-orders upcoming or in the last 14 days.
        </p>
      ) : (
        <div className="collections-screen-only flex flex-col gap-10">
          {days.map((day) => {
            const { skus, suburbs } = dayMakeListMeta(day.orders);
            return (
              <div key={day.key} className="flex flex-col gap-6">
                <MakeListSection
                  label={day.label}
                  orderCount={day.orders.length}
                  takenLabel={formatMoney(day.takenCents, day.currency)}
                  windowClosed={day.windowClosed}
                  skus={skus}
                  suburbs={suburbs}
                />
                <CollectionDaySection
                  dayKey={day.key}
                  label={`Pack · ${day.label}`}
                  orders={day.orders}
                  itemCount={day.itemCount}
                />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
