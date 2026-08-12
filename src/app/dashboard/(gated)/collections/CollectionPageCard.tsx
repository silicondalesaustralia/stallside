import { formatMoney } from "@/lib/money";
import type { PrintBrand } from "./CollectionPrintBrand";
import type { CollectionPageGroup } from "./group-collection-pages";
import { dayMakeListMeta } from "./group-collections";
import { buildCollectionsPrintPayload } from "./build-print-payload";
import CollectionDaySection from "./CollectionDaySection";
import CollectionsPrintControls from "./CollectionsPrintControls";
import MakeListSection from "./MakeListSection";

export default function CollectionPageCard({
  group,
  brand,
  defaultOpen,
}: {
  group: CollectionPageGroup;
  brand: PrintBrand;
  defaultOpen?: boolean;
}) {
  const { skus, suburbs } = dayMakeListMeta(group.orders);
  const takenLabel = formatMoney(group.takenCents, group.currency);
  const { printDays, labelOrders } = buildCollectionsPrintPayload(
    group.orders,
    group.title,
  );

  return (
    <details
      className="rounded-xl border border-[var(--line)] bg-[var(--panel)]"
      open={defaultOpen}
    >
      <summary className="collections-screen-only cursor-pointer list-none px-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{group.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {group.collectionLabel} · {group.orders.length} order
              {group.orders.length === 1 ? "" : "s"} · {takenLabel} taken
              {group.windowClosed ? " · window closed" : ""}
            </p>
          </div>
          <span className="mt-1 text-sm text-[var(--muted)]">Open</span>
        </div>
      </summary>
      <div className="collections-screen-only flex flex-col gap-6 border-t border-[var(--line)] px-4 py-4">
        <MakeListSection
          label={group.title}
          orderCount={group.orders.length}
          takenLabel={takenLabel}
          windowClosed={group.windowClosed}
          skus={skus}
          suburbs={suburbs}
        />
        <CollectionDaySection
          label={`Pack · ${group.title}`}
          orders={group.orders}
          itemCount={group.itemCount}
        />
      </div>
      <div className="border-t border-[var(--line)] px-4 py-4">
        <CollectionsPrintControls
          printId={group.key}
          sheetTitle={`${group.title} · ${group.collectionLabel}`}
          days={printDays}
          labelOrders={labelOrders}
          brand={brand}
        />
      </div>
    </details>
  );
}
