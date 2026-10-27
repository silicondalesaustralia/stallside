import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { formatMoney } from "@/lib/money";
import { dayMakeListMeta } from "@/lib/collections/group-collections";
import { buildCollectionsPrintPayload } from "../build-print-payload";
import CollectionDayEmailAll from "../CollectionDayEmailAll";
import CollectionOrdersTable from "../CollectionOrdersTable";
import CollectionsPrintControls from "../CollectionsPrintControls";
import MakeListSection from "../MakeListSection";
import { loadCollectionGroups } from "../load-collection-groups";

export default async function CollectionGroupPage({ params }: { params: Promise<{ groupKey: string }> }) {
  const { groupKey } = await params;
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) notFound();

  const { groups, brand } = await loadCollectionGroups(owner.id, selected);
  const group = groups.find((g) => g.key === decodeURIComponent(groupKey));
  if (!group) notFound();

  const { skus, suburbs } = dayMakeListMeta(group.orders);
  const takenLabel = formatMoney(group.takenCents, group.currency);
  const { printDays, labelOrders } = buildCollectionsPrintPayload(group.orders, group.title);

  return (
    <main className="flex flex-col gap-5">
      <div className="collections-screen-only">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/collections" className="underline">
            Pick Ups &amp; Delivery
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">{group.title}</h1>
        <p className="mt-1 text-[var(--muted)]">
          {group.collectionLabel}
          {group.windowClosed ? " · date passed" : ""} · {group.orders.length} order
          {group.orders.length === 1 ? "" : "s"} · {group.itemCount} item{group.itemCount === 1 ? "" : "s"} ·{" "}
          {takenLabel} taken
        </p>
      </div>

      <div className="collections-screen-only flex flex-col gap-5">
        <MakeListSection skus={skus} suburbs={suburbs} />
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Packing list</h2>
            <CollectionDayEmailAll
              orderIds={group.orders.map((order) => order.id)}
              dayLabel={group.title}
              recipientCount={group.orders.filter((order) => order.receiptEmail).length}
            />
          </div>
          <CollectionOrdersTable orders={group.orders} />
        </section>
      </div>

      <section className="dash-card px-4 py-4">
        <CollectionsPrintControls
          printId={group.key}
          sheetTitle={`${group.title} · ${group.collectionLabel}`}
          days={printDays}
          labelOrders={labelOrders}
          brand={brand}
        />
      </section>
    </main>
  );
}
