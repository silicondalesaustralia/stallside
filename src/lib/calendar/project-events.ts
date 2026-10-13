import { SellerEventStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { dayKeyInTz } from "./range";
import { resolveMarketAllDay, resolveTimedEnd } from "./event-display";
import type { CalendarEvent } from "./types";

export async function projectMarketEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
  standId?: string | null;
}): Promise<CalendarEvent[]> {
  const where: Prisma.SellerEventWhereInput = {
    ownerId: input.ownerId,
    status: { in: [SellerEventStatus.DRAFT, SellerEventStatus.LIVE] },
    startsAt: { lt: input.end },
    OR: [{ endsAt: null }, { endsAt: { gt: input.start } }],
  };
  if (input.standId) where.standId = input.standId;

  const events = await prisma.sellerEvent.findMany({
    where,
    select: {
      id: true,
      name: true,
      locationLabel: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  });

  return events.map((e) => {
    const dk = dayKeyInTz(e.startsAt, input.timeZone);
    const allDay = resolveMarketAllDay(e.startsAt, e.endsAt, input.timeZone);
    const displayEnd = resolveTimedEnd(e.startsAt, e.endsAt, allDay);
    return {
      id: `market:${e.id}`,
      type: "market" as const,
      title: e.name,
      startsAt: e.startsAt,
      endsAt: displayEnd,
      allDay,
      status: e.status,
      sourceType: "seller_event",
      sourceId: e.id,
      href: `/dashboard/events/${e.id}`,
      editHref: `/dashboard/events/${e.id}`,
      location: e.locationLabel,
      summary: e.locationLabel,
      dayKey: dk,
      sortKey: e.startsAt.toISOString(),
      metadata: {},
      editable: true,
      durationEditable: true,
      rescheduleAction: "market",
    };
  });
}
