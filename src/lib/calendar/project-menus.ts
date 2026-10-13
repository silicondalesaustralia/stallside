import { PaymentStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { dayKeyInTz } from "./range";
import type { CalendarEvent } from "./types";

const PAID: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export async function projectMenuEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
  standId?: string | null;
}): Promise<CalendarEvent[]> {
  const where: Prisma.MenuWhereInput = {
    ownerId: input.ownerId,
    kind: "PREORDER_DROP",
    isActive: true,
    OR: [
      { orderByAt: { gte: input.start, lt: input.end } },
      { collectionAt: { gte: input.start, lt: input.end } },
    ],
  };
  if (input.standId) where.standId = input.standId;

  const menus = await prisma.menu.findMany({
    where,
    select: {
      id: true,
      title: true,
      orderByAt: true,
      collectionAt: true,
      standId: true,
      items: { select: { productId: true } },
    },
  });

  const events: CalendarEvent[] = [];

  for (const menu of menus) {
    if (menu.orderByAt) {
      const dk = dayKeyInTz(menu.orderByAt, input.timeZone);
      let orderCount = 0;
      let revenueCents = 0;
      if (menu.collectionAt && menu.items.length > 0) {
        const productIds = menu.items.map((i) => i.productId);
        const agg = await prisma.order.aggregate({
          where: {
            ownerId: input.ownerId,
            standId: menu.standId,
            paymentStatus: { in: PAID },
            isPreOrder: true,
            collectionAt: menu.collectionAt,
            items: { some: { productId: { in: productIds } } },
          },
          _count: true,
          _sum: { totalCents: true },
        });
        orderCount = agg._count;
        revenueCents = agg._sum.totalCents ?? 0;
      }
      const currency =
        (
          await prisma.stand.findUnique({
            where: { id: menu.standId },
            select: { currency: true },
          })
        )?.currency ?? "AUD";

      events.push({
        id: `menu_close:${menu.id}:${dk}`,
        type: "menu_close",
        title: `Orders close — ${menu.title}`,
        startsAt: menu.orderByAt,
        endsAt: null,
        allDay: false,
        status: null,
        sourceType: "menu",
        sourceId: menu.id,
        href: `/dashboard/menus/${menu.id}`,
        editHref: `/dashboard/menus/${menu.id}`,
        location: null,
        summary:
          orderCount > 0
            ? `${orderCount} orders · ${formatMoney(revenueCents, currency)}`
            : null,
        dayKey: dk,
        sortKey: menu.orderByAt.toISOString(),
        metadata: { orderCount, revenueCents },
        editable: true,
        durationEditable: false,
        rescheduleAction: "menu_close",
      });
    }
  }

  return events;
}
