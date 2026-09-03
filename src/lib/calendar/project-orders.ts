import {
  FulfilmentStatus,
  HandoverMode,
  PaymentStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { OPS_PAYMENT_STATUSES } from "@/lib/ops/board";
import { dayKeyInTz } from "./range";
import type { CalendarEvent } from "./types";

const READONLY_EVENT = {
  editable: false,
  durationEditable: false,
  rescheduleAction: null,
} as const;

type LoadedOrder = {
  id: string;
  collectionAt: Date | null;
  handoverMode: HandoverMode;
  collectionStatus: string | null;
  shopperSubscriptionId: string | null;
  items: { packedAt: Date | null }[];
  fulfilment: {
    fulfilmentStatus: FulfilmentStatus;
    pickupLocationName: string | null;
    pickupPublicLabel: string | null;
    windowLabel: string | null;
    deliveryZoneName: string | null;
    collectionStartsAt: Date | null;
    collectionEndsAt: Date | null;
    fulfilmentOptionId: string | null;
    handoverMode: HandoverMode;
  } | null;
};

function resolveWhen(order: LoadedOrder): Date {
  return (
    order.collectionAt ??
    order.fulfilment?.collectionStartsAt ??
    new Date()
  );
}

function isReady(order: LoadedOrder): boolean {
  const fs = order.fulfilment?.fulfilmentStatus;
  if (fs === FulfilmentStatus.READY || fs === FulfilmentStatus.OUT_FOR_DELIVERY) {
    return true;
  }
  return order.collectionStatus === "READY";
}

function groupKey(
  order: LoadedOrder,
  dk: string,
  handover: HandoverMode,
): string {
  const f = order.fulfilment;
  const loc = f?.pickupPublicLabel || f?.pickupLocationName || f?.deliveryZoneName || "default";
  const win = f?.windowLabel || f?.fulfilmentOptionId || "";
  return `${dk}|${handover}|${loc}|${win}`;
}

export async function projectOrderFulfilmentEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
  standId?: string | null;
}): Promise<CalendarEvent[]> {
  const where: Prisma.OrderWhereInput = {
    ownerId: input.ownerId,
    paymentStatus: { in: OPS_PAYMENT_STATUSES },
    OR: [
      { collectionAt: { gte: input.start, lt: input.end } },
      {
        fulfilment: {
          collectionStartsAt: { gte: input.start, lt: input.end },
        },
      },
    ],
  };
  if (input.standId) where.standId = input.standId;

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      collectionAt: true,
      handoverMode: true,
      collectionStatus: true,
      shopperSubscriptionId: true,
      items: { select: { packedAt: true } },
      fulfilment: {
        select: {
          fulfilmentStatus: true,
          pickupLocationName: true,
          pickupPublicLabel: true,
          windowLabel: true,
          deliveryZoneName: true,
          collectionStartsAt: true,
          collectionEndsAt: true,
          fulfilmentOptionId: true,
          handoverMode: true,
        },
      },
    },
  });

  const pickupGroups = new Map<
    string,
    { orders: LoadedOrder[]; when: Date; label: string; location: string | null; ends: Date | null }
  >();
  const deliveryGroups = new Map<
    string,
    { orders: LoadedOrder[]; when: Date; label: string }
  >();
  const packingGroups = new Map<
    string,
    { orders: LoadedOrder[]; when: Date; title: string }
  >();
  const subGroups = new Map<string, { orders: LoadedOrder[]; when: Date }>();

  for (const order of orders) {
    const when = resolveWhen(order);
    const dk = dayKeyInTz(when, input.timeZone);
    const handover = order.fulfilment?.handoverMode ?? order.handoverMode;

    if (order.shopperSubscriptionId) {
      const sk = `sub:${dk}`;
      const g = subGroups.get(sk) ?? { orders: [], when };
      g.orders.push(order);
      subGroups.set(sk, g);
    }

    const packed = order.items.filter((i) => i.packedAt).length;
    const total = order.items.length;
    if (total > 0 && packed < total) {
      const pk = `pack:${dk}`;
      const g = packingGroups.get(pk) ?? {
        orders: [],
        when,
        title: "Pack orders",
      };
      g.orders.push(order);
      packingGroups.set(pk, g);
    }

    if (handover === HandoverMode.DELIVER) {
      const label = order.fulfilment?.deliveryZoneName ?? "Delivery";
      const gk = groupKey(order, dk, HandoverMode.DELIVER);
      const g = deliveryGroups.get(gk) ?? {
        orders: [],
        when,
        label,
      };
      g.orders.push(order);
      deliveryGroups.set(gk, g);
    } else {
      const loc =
        order.fulfilment?.pickupPublicLabel ||
        order.fulfilment?.pickupLocationName ||
        null;
      const label = loc ?? order.fulfilment?.windowLabel ?? "Pickup";
      const gk = groupKey(order, dk, HandoverMode.COLLECT);
      const g = pickupGroups.get(gk) ?? {
        orders: [],
        when,
        label,
        location: loc,
        ends: order.fulfilment?.collectionEndsAt ?? null,
      };
      g.orders.push(order);
      pickupGroups.set(gk, g);
    }
  }

  const events: CalendarEvent[] = [];

  for (const [gk, g] of pickupGroups) {
    const dk = dayKeyInTz(g.when, input.timeZone);
    const ready = g.orders.filter(isReady).length;
    events.push({
      id: `pickup:${gk}`,
      type: "pickup",
      title: g.label,
      startsAt: g.when,
      endsAt: g.ends,
      allDay: !g.ends,
      status: null,
      sourceType: "pickup_window",
      sourceId: gk,
      href: `/dashboard/fulfilment/orders?view=today`,
      editHref: "/dashboard/fulfilment/pickup",
      location: g.location,
      summary: `${g.orders.length} orders · ${ready} ready`,
      dayKey: dk,
      sortKey: g.when.toISOString(),
      metadata: { orderCount: g.orders.length, readyCount: ready },
      ...READONLY_EVENT,
    });
  }

  for (const [gk, g] of deliveryGroups) {
    const dk = dayKeyInTz(g.when, input.timeZone);
    const ready = g.orders.filter(isReady).length;
    events.push({
      id: `delivery:${gk}`,
      type: "delivery",
      title: g.label,
      startsAt: g.when,
      endsAt: null,
      allDay: true,
      status: null,
      sourceType: "delivery_zone",
      sourceId: gk,
      href: `/dashboard/fulfilment/orders/print/delivery`,
      editHref: "/dashboard/fulfilment/delivery",
      location: null,
      summary: `${g.orders.length} orders · ${ready} ready`,
      dayKey: dk,
      sortKey: g.when.toISOString(),
      metadata: { orderCount: g.orders.length, readyCount: ready },
      ...READONLY_EVENT,
    });
  }

  for (const [pk, g] of packingGroups) {
    const dk = dayKeyInTz(g.when, input.timeZone);
    let packedOrders = 0;
    for (const o of g.orders) {
      const t = o.items.length;
      const p = o.items.filter((i) => i.packedAt).length;
      if (t > 0 && p >= t) packedOrders += 1;
    }
    events.push({
      id: pk,
      type: "packing",
      title: g.title,
      startsAt: g.when,
      endsAt: null,
      allDay: true,
      status: null,
      sourceType: "packing",
      sourceId: dk,
      href: `/dashboard/fulfilment/orders?view=today`,
      editHref: null,
      location: null,
      summary: `${packedOrders} / ${g.orders.length} packed`,
      dayKey: dk,
      sortKey: `b:${g.when.toISOString()}`,
      metadata: {
        packedOrders,
        totalOrders: g.orders.length,
      },
      ...READONLY_EVENT,
    });
  }

  for (const [sk, g] of subGroups) {
    const dk = dayKeyInTz(g.when, input.timeZone);
    events.push({
      id: sk,
      type: "subscription",
      title: "Subscription fulfilment",
      startsAt: g.when,
      endsAt: null,
      allDay: true,
      status: null,
      sourceType: "subscription",
      sourceId: dk,
      href: `/dashboard/subscriptions`,
      editHref: "/dashboard/subscriptions",
      location: null,
      summary: `${g.orders.length} orders`,
      dayKey: dk,
      sortKey: g.when.toISOString(),
      metadata: { orderCount: g.orders.length },
      ...READONLY_EVENT,
    });
  }

  return events;
}
