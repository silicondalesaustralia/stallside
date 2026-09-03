import { prisma } from "@/lib/prisma";
import { buildProductionGroups } from "@/lib/production/aggregate";
import { dayKeyInTz } from "./range";
import type { CalendarEvent } from "./types";

export async function projectProductionEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
  standId?: string | null;
}): Promise<CalendarEvent[]> {
  const stands = input.standId
    ? [{ id: input.standId }]
    : await prisma.stand.findMany({
        where: { ownerId: input.ownerId, isActive: true },
        select: { id: true },
      });

  const events: CalendarEvent[] = [];

  for (const stand of stands) {
    const groups = await buildProductionGroups({
      ownerId: input.ownerId,
      standId: stand.id,
      from: input.start,
      to: input.end,
      timeZone: input.timeZone,
    });

    for (const g of groups) {
      if (!g.collectionAt) continue;
      const dk = dayKeyInTz(g.collectionAt, input.timeZone);
      const itemTotal = g.products.reduce((s, p) => s + p.quantity, 0);
      const top = g.products
        .slice(0, 3)
        .map((p) => `${p.quantity} ${p.name}`)
        .join(" · ");

      events.push({
        id: `production:${g.groupKey}`,
        type: "production",
        title: `Production — ${g.title.split(" · ")[0] ?? g.title}`,
        startsAt: g.collectionAt,
        endsAt: null,
        allDay: true,
        status: null,
        sourceType: "production",
        sourceId: g.groupKey,
        href: `/dashboard/production?range=week&key=${encodeURIComponent(g.groupKey)}${g.menuId ? `&menuId=${g.menuId}` : ""}`,
        editHref: null,
        location: null,
        summary:
          itemTotal > 0
            ? `${itemTotal} items to make${top ? ` · ${top}` : ""}`
            : null,
        dayKey: dk,
        sortKey: `a:${g.collectionAt.toISOString()}`,
        metadata: { itemTotal, orderCount: g.orderCount },
        editable: false,
        durationEditable: false,
        rescheduleAction: null,
      });
    }
  }

  return events;
}
