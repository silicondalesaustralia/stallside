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
import { ownerHasProAccess } from "@/lib/owner-trial";
import Link from "next/link";
import OrderDeleteButton from "./OrderDeleteButton";
import OrderCustomerEmail from "../collections/OrderCustomerEmail";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const window = resolveDateWindow(params);
  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });

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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {order.orderNumber} · {order.stand.name}
                    </p>
                    <p>{formatMoney(order.totalCents, order.currency)}</p>
                  </div>
                  <p className="mt-1 text-[var(--muted)]">
                    {order.createdAt.toLocaleString()} ·{" "}
                    {orderPaymentLabel(
                      order.paymentMethod,
                      order.localTransferMethodId,
                    )}{" "}
                    · {paymentStatusNote(order.paymentStatus)}
                    {order.customerName ? ` · ${order.customerName}` : ""}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                  {order.receiptEmail ? (
                    <div className="mt-1">
                      <OrderCustomerEmail
                        orderId={order.id}
                        email={order.receiptEmail}
                        defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
                      />
                    </div>
                  ) : null}
                  <p className="mt-2 text-[var(--muted)]">
                    {order.items
                      .map(
                        (item) =>
                          `${item.quantity}× ${item.productNameSnapshot}${
                            item.optionsSnapshot
                              ? ` (${item.optionsSnapshot})`
                              : ""
                          }`,
                      )
                      .join(", ")}
                  </p>
                </div>
                <OrderDeleteButton
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  restoresStock={COUNTED_STATUSES.includes(order.paymentStatus)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
