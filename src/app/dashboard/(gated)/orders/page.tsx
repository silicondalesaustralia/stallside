import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DateRangeFilter from "@/components/DateRangeFilter";
import SalesAnalyticsPanel from "@/components/SalesAnalyticsPanel";
import { resolveDateWindow } from "@/lib/date-range";
import {
  COUNTED_STATUSES,
  summarizeByChannel,
} from "@/lib/order-metrics";
import { buildChannelSalesSeries } from "@/lib/sales-series";
import { ownerHasProAccess } from "@/lib/owner-trial";
import Link from "next/link";
import OrderListRow from "./OrderListRow";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    q?: string;
    customerId?: string;
  }>;
}) {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const params = await searchParams;
  const window = resolveDateWindow(params);
  const emailQuery = params.q?.trim();
  const customerId = params.customerId?.trim();
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
  const metricSelect = {
    totalCents: true,
    paymentMethod: true,
    currency: true,
    createdAt: true,
    isPreOrder: true,
    shopperSubscriptionId: true,
  } as const;

  const listFilter = {
    ...standScope,
    createdAt: { gte: window.start, lte: window.end },
    ...(customerId ? { customerId } : {}),
    ...(emailQuery
      ? {
          OR: [
            {
              receiptEmail: { contains: emailQuery, mode: "insensitive" as const },
            },
            {
              customerName: { contains: emailQuery, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
  };

  const [currentOrders, previousOrders, listedOrders, filterCustomer] =
    await Promise.all([
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.start, lte: window.end },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: metricSelect,
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.prevStart, lte: window.prevEnd },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: metricSelect,
    }),
    prisma.order.findMany({
      where: listFilter,
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
        isPreOrder: true,
        shopperSubscriptionId: true,
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
    customerId
      ? prisma.customer.findFirst({
          where: { id: customerId, ownerId: owner.id },
          select: { name: true, email: true },
        })
      : Promise.resolve(null),
  ]);

  const currentSummaries = summarizeByChannel(currentOrders);
  const previousSummaries = summarizeByChannel(previousOrders);
  const channels = buildChannelSalesSeries(
    currentOrders,
    window.start,
    window.end,
  );
  const previousPoints = buildChannelSalesSeries(
    previousOrders,
    window.prevStart,
    window.prevEnd,
  ).all;

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Orders
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {listedOrders.length} order{listedOrders.length === 1 ? "" : "s"} ·{" "}
          {selected.name} · {window.label}
          {filterCustomer
            ? ` · ${filterCustomer.name || filterCustomer.email}`
            : emailQuery
              ? ` · “${emailQuery}”`
              : ""}
        </p>
        {(emailQuery || customerId) && (
          <p className="mt-2 text-sm">
            <Link href="/dashboard/orders" className="underline">
              Clear filter
            </Link>
          </p>
        )}
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

      <SalesAnalyticsPanel
        channels={channels}
        previousPoints={previousPoints}
        currentSummaries={currentSummaries}
        previousSummaries={previousSummaries}
        chartTitle="Sales over time"
        layout="orders"
      />

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
