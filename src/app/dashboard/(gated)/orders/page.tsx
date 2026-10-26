import Link from "next/link";
import { requireOwner } from "@/lib/session";
import DateRangeFilter from "@/components/DateRangeFilter";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { RANGE_PRESETS, resolveDateWindow } from "@/lib/date-range";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { loadOrdersPage, ORDERS_LIST_LIMIT } from "@/lib/orders/load-orders-page";
import OrdersExportBar from "./OrdersExportBar";
import OrdersStats from "./OrdersStats";
import OrdersTable from "./OrdersTable";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { resolveStandTimezone } from "@/lib/stand-timezone";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const params = await searchParams;
  const cardTier = ownerHasProAccess(owner, { email: user.email, role: user.role });

  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Orders" />
        <NoBusinessYet />
      </main>
    );
  }

  const timeZone = resolveStandTimezone(selected.timezone);
  const window = resolveDateWindow(params, timeZone);
  const data = await loadOrdersPage({ ownerId: owner.id, standId: selected.id, window });
  const count = data.orders.length;

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        subtitle={`${selected.name} · ${window.label}`}
        actions={
          cardTier ? (
            <Link
              href="/dashboard/collections"
              className="text-sm font-semibold text-[var(--leaf-dark)] underline"
            >
              Pre-order collections
            </Link>
          ) : null
        }
      />

      <DateRangeFilter
        pathname="/dashboard/orders"
        presets={RANGE_PRESETS}
        activeKey={window.key}
        from={window.fromParam}
        to={window.toParam}
      />

      <OrdersStats
        current={data.current}
        previous={data.previous}
        refundedCents={data.refundedCents}
        currency={data.currency}
        window={window}
        timeZone={timeZone}
      />

      {count === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No orders in this range.
        </div>
      ) : (
        <OrdersTable
          orders={data.orders}
          timeZone={timeZone}
          footer={
            count === ORDERS_LIST_LIMIT
              ? `Showing the latest ${ORDERS_LIST_LIMIT} orders. Narrow the date range or export to see more.`
              : `${count} order${count === 1 ? "" : "s"}`
          }
        />
      )}

      <OrdersExportBar range={window.key} from={window.fromParam} to={window.toParam} />
    </main>
  );
}
