import crypto from "node:crypto";
import {
  FulfilmentStatus,
  HandoverMode,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canTransitionOps,
  fulfilmentToCollectionStatus,
} from "@/lib/ops/status";

/** Paid / deposit states that belong on the ops board (not cancelled). */
export const OPS_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export function newOpsLookupToken(): string {
  return crypto.randomBytes(18).toString("base64url");
}

export async function ensureOpsLookupToken(orderId: string, ownerId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ownerId },
    select: { id: true, opsLookupToken: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.opsLookupToken) return order.opsLookupToken;
  const token = newOpsLookupToken();
  await prisma.order.update({
    where: { id: order.id },
    data: { opsLookupToken: token },
  });
  return token;
}

export type SetOpsStatusInput = {
  ownerId: string;
  orderIds: string[];
  status: FulfilmentStatus;
};

/**
 * Dual-write fulfilmentStatus + legacy collectionStatus.
 * Ensures OrderFulfilment exists (creates minimal row if missing).
 */
export async function setOrdersOpsStatus(input: SetOpsStatusInput) {
  const uniqueIds = [...new Set(input.orderIds)].filter(Boolean);
  if (uniqueIds.length === 0) return { updated: 0, errors: [] as string[] };

  const orders = await prisma.order.findMany({
    where: { id: { in: uniqueIds }, ownerId: input.ownerId },
    select: {
      id: true,
      collectionStatus: true,
      handoverMode: true,
      paymentStatus: true,
      fulfilment: { select: { id: true, fulfilmentStatus: true, handoverMode: true } },
    },
  });

  if (orders.length !== uniqueIds.length) {
    return {
      updated: 0,
      errors: ["One or more orders were not found for this account."],
    };
  }

  const errors: string[] = [];
  let updated = 0;

  for (const order of orders) {
    if (
      order.paymentStatus === PaymentStatus.CANCELLED ||
      order.paymentStatus === PaymentStatus.REFUNDED ||
      order.paymentStatus === PaymentStatus.FAILED ||
      order.paymentStatus === PaymentStatus.EXPIRED
    ) {
      errors.push(`${order.id}: cancelled/failed orders cannot change ops status`);
      continue;
    }

    const from =
      order.fulfilment?.fulfilmentStatus ??
      (order.collectionStatus === "READY"
        ? FulfilmentStatus.READY
        : order.collectionStatus === "COLLECTED"
          ? FulfilmentStatus.COLLECTED
          : FulfilmentStatus.NEW);

    if (!canTransitionOps(from, input.status)) {
      errors.push(`${order.id}: cannot move from ${from} to ${input.status}`);
      continue;
    }

    const collectionStatus = fulfilmentToCollectionStatus(input.status);
    const handoverMode =
      order.fulfilment?.handoverMode ?? order.handoverMode ?? HandoverMode.COLLECT;

    await prisma.$transaction(async (tx) => {
      if (order.fulfilment) {
        await tx.orderFulfilment.update({
          where: { id: order.fulfilment.id },
          data: { fulfilmentStatus: input.status },
        });
      } else {
        await tx.orderFulfilment.create({
          data: {
            orderId: order.id,
            kind: "STAND_IMMEDIATE",
            optionLabel: "Order",
            handoverMode,
            fulfilmentStatus: input.status,
          },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          collectionStatus:
            collectionStatus === null
              ? undefined
              : collectionStatus,
        },
      });
    });
    updated += 1;
  }

  return { updated, errors };
}

export async function setOrderItemPacked(input: {
  ownerId: string;
  orderItemId: string;
  packed: boolean;
}) {
  const item = await prisma.orderItem.findFirst({
    where: { id: input.orderItemId, order: { ownerId: input.ownerId } },
    select: { id: true },
  });
  if (!item) throw new Error("Item not found");
  return prisma.orderItem.update({
    where: { id: item.id },
    data: { packedAt: input.packed ? new Date() : null },
  });
}

export async function updateFulfilmentSellerNotes(input: {
  ownerId: string;
  orderId: string;
  notes: string;
}) {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, ownerId: input.ownerId },
    select: { id: true, fulfilment: { select: { id: true } }, handoverMode: true },
  });
  if (!order) throw new Error("Order not found");
  const notes = input.notes.trim().slice(0, 2000) || null;
  if (order.fulfilment) {
    return prisma.orderFulfilment.update({
      where: { id: order.fulfilment.id },
      data: { sellerNotes: notes },
    });
  }
  return prisma.orderFulfilment.create({
    data: {
      orderId: order.id,
      kind: "STAND_IMMEDIATE",
      optionLabel: "Order",
      handoverMode: order.handoverMode,
      sellerNotes: notes,
    },
  });
}

export type OpsBoardFilter = {
  ownerId: string;
  view: "today" | "tomorrow" | "upcoming" | "ready" | "completed" | "all";
  standId?: string | null;
  handover?: "collect" | "deliver" | null;
  status?: FulfilmentStatus | null;
  q?: string | null;
};

function dayBounds(base: Date, offsetDays: number) {
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

const OPS_ORDER_SELECT = {
  id: true,
  orderNumber: true,
  customerName: true,
  customerPhone: true,
  receiptEmail: true,
  collectionAt: true,
  collectionNote: true,
  collectionStatus: true,
  paymentStatus: true,
  handoverMode: true,
  deliveryAddressLine1: true,
  deliverySuburb: true,
  deliveryPostcode: true,
  deliveryNotes: true,
  totalCents: true,
  currency: true,
  isPreOrder: true,
  opsLookupToken: true,
  createdAt: true,
  stand: { select: { id: true, name: true, slug: true } },
  fulfilment: {
    select: {
      fulfilmentStatus: true,
      optionLabel: true,
      pickupLocationName: true,
      pickupPublicLabel: true,
      windowLabel: true,
      collectionStartsAt: true,
      deliveryZoneName: true,
      sellerNotes: true,
      handoverMode: true,
      kind: true,
    },
  },
  items: {
    select: {
      id: true,
      productNameSnapshot: true,
      optionsSnapshot: true,
      quantity: true,
      packedAt: true,
    },
  },
} satisfies Prisma.OrderSelect;

export async function loadOpsBoardOrders(filter: OpsBoardFilter) {
  const now = new Date();
  const today = dayBounds(now, 0);
  const tomorrow = dayBounds(now, 1);

  const where: Prisma.OrderWhereInput = {
    ownerId: filter.ownerId,
    paymentStatus: { in: OPS_PAYMENT_STATUSES },
    ...(filter.standId ? { standId: filter.standId } : {}),
    ...(filter.handover === "collect"
      ? { handoverMode: HandoverMode.COLLECT }
      : filter.handover === "deliver"
        ? { handoverMode: HandoverMode.DELIVER }
        : {}),
  };

  if (filter.q?.trim()) {
    const q = filter.q.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { receiptEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filter.view === "ready") {
    where.OR = [
      { fulfilment: { fulfilmentStatus: FulfilmentStatus.READY } },
      {
        fulfilment: null,
        collectionStatus: "READY",
      },
    ];
  } else if (filter.view === "completed") {
    where.OR = [
      {
        fulfilment: {
          fulfilmentStatus: {
            in: [FulfilmentStatus.COLLECTED, FulfilmentStatus.DELIVERED],
          },
        },
      },
      { fulfilment: null, collectionStatus: "COLLECTED" },
    ];
  } else if (filter.view === "today") {
    where.AND = [
      {
        OR: [
          { collectionAt: { gte: today.start, lt: today.end } },
          {
            collectionAt: null,
            fulfilment: {
              collectionStartsAt: { gte: today.start, lt: today.end },
            },
          },
          {
            collectionAt: null,
            fulfilment: null,
            createdAt: { gte: today.start, lt: today.end },
          },
        ],
      },
    ];
  } else if (filter.view === "tomorrow") {
    where.AND = [
      {
        OR: [
          { collectionAt: { gte: tomorrow.start, lt: tomorrow.end } },
          {
            fulfilment: {
              collectionStartsAt: { gte: tomorrow.start, lt: tomorrow.end },
            },
          },
        ],
      },
    ];
  } else if (filter.view === "upcoming") {
    where.AND = [
      {
        OR: [
          { collectionAt: { gte: tomorrow.end } },
          { fulfilment: { collectionStartsAt: { gte: tomorrow.end } } },
        ],
      },
      {
        NOT: {
          OR: [
            {
              fulfilment: {
                fulfilmentStatus: {
                  in: [
                    FulfilmentStatus.COLLECTED,
                    FulfilmentStatus.DELIVERED,
                    FulfilmentStatus.CANCELLED,
                  ],
                },
              },
            },
            { collectionStatus: "COLLECTED" },
          ],
        },
      },
    ];
  }

  if (filter.status) {
    const statusClause: Prisma.OrderWhereInput = {
      fulfilment: { fulfilmentStatus: filter.status },
    };
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      statusClause,
    ];
  }

  return prisma.order.findMany({
    where,
    orderBy: [{ collectionAt: "asc" }, { createdAt: "asc" }],
    take: 200,
    select: OPS_ORDER_SELECT,
  });
}

export async function loadOpsOrderById(ownerId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, ownerId },
    select: OPS_ORDER_SELECT,
  });
}

export type OpsBoardOrder = NonNullable<
  Awaited<ReturnType<typeof loadOpsOrderById>>
>;

export function resolveOpsStatus(order: OpsBoardOrder): FulfilmentStatus {
  if (order.fulfilment?.fulfilmentStatus) return order.fulfilment.fulfilmentStatus;
  if (order.collectionStatus === "READY") return FulfilmentStatus.READY;
  if (order.collectionStatus === "COLLECTED") return FulfilmentStatus.COLLECTED;
  return FulfilmentStatus.NEW;
}

export function packingProgress(order: OpsBoardOrder) {
  const total = order.items.length;
  const packed = order.items.filter((i) => i.packedAt).length;
  return { packed, total };
}
