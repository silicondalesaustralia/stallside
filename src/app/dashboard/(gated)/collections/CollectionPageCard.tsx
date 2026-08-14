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
      className="dash-card overflow-hidden"
      open={defaultOpen}
    >
      <summary className="collections-screen-only cursor-pointer list-none px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="relative flex items-start justify-between gap-3 pl-3">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-[var(--field)]"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {group.collectionLabel}
              {group.windowClosed ? " · Window closed" : ""}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">
              {group.title}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {group.orders.length} order
              {group.orders.length === 1 ? "" : "s"} · {takenLabel} taken
            </p>
          </div>
          <span className="mt-1 rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-bold text-[var(--ink-on-dark)]">
            Open
          </span>
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
