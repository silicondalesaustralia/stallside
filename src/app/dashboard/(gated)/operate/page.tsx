import Link from "next/link";
import {
  CustomOrderRequestStatus,
  FulfilmentStatus,
  SellerEventStatus,
} from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OPS_PAYMENT_STATUSES } from "@/lib/ops/board";
import { loadComingUpSummary } from "@/lib/calendar/load";
import { resolveStandTimezone } from "@/lib/stand-timezone";

function dayBounds(offsetDays: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export default async function OperateHomePage() {
  const { owner } = await requireOwner();
  const timeZone = resolveStandTimezone(owner.defaultTimezone);
  const today = dayBounds(0);
  const soon = dayBounds(14);

  const [
    toPrepare,
    ready,
    deliveriesToday,
    pendingRequests,
    liveEvents,
    upcomingEvents,
    comingUp,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        ownerId: owner.id,
        paymentStatus: { in: OPS_PAYMENT_STATUSES },
        OR: [
          {
            fulfilment: {
              fulfilmentStatus: {
                in: [FulfilmentStatus.NEW, FulfilmentStatus.PREPARING],
              },
            },
          },
          {
            fulfilment: null,
            OR: [{ collectionStatus: "ORDERED" }, { collectionStatus: null }],
          },
        ],
      },
    }),
    prisma.order.count({
      where: {
        ownerId: owner.id,
        paymentStatus: { in: OPS_PAYMENT_STATUSES },
        OR: [
          { fulfilment: { fulfilmentStatus: FulfilmentStatus.READY } },
          { fulfilment: null, collectionStatus: "READY" },
        ],
      },
    }),
    prisma.order.count({
      where: {
        ownerId: owner.id,
        paymentStatus: { in: OPS_PAYMENT_STATUSES },
        handoverMode: "DELIVER",
        OR: [
          { collectionAt: { gte: today.start, lt: today.end } },
          {
            fulfilment: {
              collectionStartsAt: { gte: today.start, lt: today.end },
            },
          },
        ],
      },
    }),
    prisma.customOrderRequest.count({
      where: {
        ownerId: owner.id,
        status: {
          in: [
            CustomOrderRequestStatus.SUBMITTED,
            CustomOrderRequestStatus.REVIEWING,
          ],
        },
      },
    }),
    prisma.sellerEvent.count({
      where: { ownerId: owner.id, status: SellerEventStatus.LIVE },
    }),
    prisma.sellerEvent.count({
      where: {
        ownerId: owner.id,
        status: { in: [SellerEventStatus.DRAFT, SellerEventStatus.LIVE] },
        startsAt: { gte: today.start, lt: soon.end },
      },
    }),
    loadComingUpSummary({ ownerId: owner.id, timeZone, limit: 4 }),
  ]);

  const cards = [
    { href: "/dashboard/fulfilment/orders", label: "To prepare", value: toPrepare },
    { href: "/dashboard/fulfilment/orders?view=ready", label: "Ready", value: ready },
    {
      href: "/dashboard/fulfilment/orders?handover=deliver",
      label: "Deliveries today",
      value: deliveriesToday,
    },
    { href: "/dashboard/forms", label: "Pending custom requests", value: pendingRequests },
    {
      href: "/dashboard/events",
      label: "Live / upcoming events",
      value: liveEvents + upcomingEvents,
    },
  ] as const;

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Operate</h1>
        <p className="mt-1 text-[var(--muted)]">
          Packing, handovers, custom requests, and market days.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className="dash-card flex flex-col gap-1 p-4 transition hover:border-[var(--leaf)]"
            >
              <span className="text-sm text-[var(--muted)]">{c.label}</span>
              <span className="text-3xl font-semibold tabular-nums">{c.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="dash-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Coming up</h2>
          <Link href="/dashboard/calendar" className="text-sm font-semibold underline">
            Open calendar
          </Link>
        </div>
        {comingUp.lines.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Nothing on the schedule for the next week yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {comingUp.lines.map((line) => (
              <li key={line} className="text-[var(--muted)]">
                {line}
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="flex flex-wrap gap-4 text-sm">
        <Link href="/dashboard/calendar" className="underline">
          Calendar
        </Link>
        <Link href="/dashboard/fulfilment/orders" className="underline">
          Orders to pack
        </Link>
        <Link href="/dashboard/forms" className="underline">
          Custom orders
        </Link>
        <Link href="/dashboard/events" className="underline">
          Markets & events
        </Link>
        <Link href="/dashboard/production" className="underline">
          Production
        </Link>
        <Link href="/dashboard/collections" className="underline">
          Collections
        </Link>
      </nav>
    </main>
  );
}
