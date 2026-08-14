import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import DashboardStat from "@/components/DashboardStat";
import DateRangeFilter from "@/components/DateRangeFilter";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { resolveDateWindow } from "@/lib/date-range";
import { COUNTED_STATUSES, summarizeOrders } from "@/lib/order-metrics";
import { buildSalesSeries } from "@/lib/sales-series";
import { ownerHasProAccess } from "@/lib/owner-trial";
import Link from "next/link";
import OrderListRow from "./OrderListRow";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const params = await searchParams;
  const window = resolveDateWindow(params);
  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Orders
        </h1>
        <NoBusinessYet />
      </main>
    );
  }

  const standScope = { ownerId: owner.id, standId: selected.id };

  const [currentOrders, previousOrders, listedOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.start, lte: window.end },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: {
        totalCents: true,
        paymentMethod: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.prevStart, lte: window.prevEnd },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: {
        totalCents: true,
        paymentMethod: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.start, lte: window.end },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        paymentMethod: true,
        localTransferMethodId: true,
        paymentStatus: true,
        customerName: true,
        customerPhone: true,
        receiptEmail: true,
        stand: { select: { name: true } },
        items: {
          select: {
            quantity: true,
            productNameSnapshot: true,
            optionsSnapshot: true,
          },
        },
      },
    }),
  ]);

  const current = summarizeOrders(currentOrders);
  const previous = summarizeOrders(previousOrders);
  const series = buildSalesSeries(currentOrders, window.start, window.end);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Orders
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {listedOrders.length} order{listedOrders.length === 1 ? "" : "s"} ·{" "}
          {selected.name} · {window.label}
        </p>
        {cardTier ? (
          <p className="mt-2 text-sm md:hidden">
            <Link
              href="/dashboard/collections"
              className="font-semibold text-[var(--leaf-dark)] underline"
            >
              Pre-order collections
            </Link>
          </p>
        ) : null}
      </div>

      <DateRangeFilter
        pathname="/dashboard/orders"
        activeKey={window.key}
        from={window.fromParam}
        to={window.toParam}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStat
          label="Sales"
          value={formatMoney(current.salesCents, current.currency)}
          current={current.salesCents}
          previous={previous.salesCents}
        />
        <DashboardStat
          label="Cash / PayID"
          value={formatMoney(current.cashCents, current.currency)}
          current={current.cashCents}
          previous={previous.cashCents}
        />
        <DashboardStat
          label="Card / PayPal"
          value={formatMoney(current.digitalCents, current.currency)}
          current={current.digitalCents}
          previous={previous.digitalCents}
        />
        <DashboardStat
          label="Orders"
          value={String(current.orderCount)}
          current={current.orderCount}
          previous={previous.orderCount}
        />
      </section>

      <SalesSeriesChart points={series} currency={current.currency} />

      {listedOrders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No orders in this range.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {listedOrders.map((order) => (
            <OrderListRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </main>
  );
}
