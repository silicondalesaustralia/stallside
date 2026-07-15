import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import DashboardStat from "@/components/DashboardStat";
import DateRangeFilter from "@/components/DateRangeFilter";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { resolveDateWindow } from "@/lib/date-range";
import { COUNTED_STATUSES, summarizeOrders } from "@/lib/order-metrics";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";
import { buildSalesSeries } from "@/lib/sales-series";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const window = resolveDateWindow(params);

  const [currentOrders, previousOrders, listedOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        ownerId: owner.id,
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
        ownerId: owner.id,
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
        ownerId: owner.id,
        createdAt: { gte: window.start, lte: window.end },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { stand: true, items: true },
    }),
  ]);

  const current = summarizeOrders(currentOrders);
  const previous = summarizeOrders(previousOrders);
  const series = buildSalesSeries(currentOrders, window.start, window.end);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-[var(--muted)]">
          {window.label} - cash, PayID, card, and PayPal sales at your stands.
        </p>
      </div>

      <DateRangeFilter
        pathname="/dashboard/orders"
        activeKey={window.key}
        from={window.fromParam}
        to={window.toParam}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {listedOrders.map((order) => (
            <li key={order.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {order.orderNumber} · {order.stand.name}
                </p>
                <p>{formatMoney(order.totalCents, order.currency)}</p>
              </div>
              <p className="mt-1 text-[var(--muted)]">
                {order.createdAt.toLocaleString()} ·{" "}
                {orderPaymentLabel(order.paymentMethod, order.localTransferMethodId)} ·{" "}
                {paymentStatusNote(order.paymentStatus)}
                {order.receiptEmail ? ` · ${order.receiptEmail}` : ""}
              </p>
              <p className="mt-2 text-[var(--muted)]">
                {order.items
                  .map((item) => `${item.quantity}× ${item.productNameSnapshot}`)
                  .join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
