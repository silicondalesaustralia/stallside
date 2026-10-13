import { prisma } from "@/lib/prisma";
import { formatPickupWindowLabel } from "@/lib/fulfilment/window-format";
import { dayKeyInTz } from "./range";
import {
  expandDeliveryZoneInstances,
  expandPickupWindowInstances,
} from "./expand-windows";
import type { CalendarEvent } from "./types";

export async function projectFulfilmentWindowEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
}): Promise<CalendarEvent[]> {
  const [pickupWindows, deliveryZones] = await Promise.all([
    prisma.pickupWindow.findMany({
      where: { ownerId: input.ownerId, isActive: true },
      select: {
        id: true,
        label: true,
        recurrence: true,
        timezone: true,
        weekday: true,
        startTimeMin: true,
        endTimeMin: true,
        startsAt: true,
        endsAt: true,
        pickupLocation: { select: { publicLabel: true, name: true } },
      },
    }),
    prisma.deliveryZone.findMany({
      where: { ownerId: input.ownerId, isActive: true },
      select: {
        id: true,
        name: true,
        timezone: true,
        weekday: true,
        startTimeMin: true,
        endTimeMin: true,
      },
    }),
  ]);

  const events: CalendarEvent[] = [];

  for (const w of pickupWindows) {
    const label =
      w.label?.trim() ||
      w.pickupLocation?.publicLabel ||
      w.pickupLocation?.name ||
      formatPickupWindowLabel(w);
    for (const inst of expandPickupWindowInstances(w, input.start, input.end)) {
      const dk = dayKeyInTz(inst.startsAt, w.timezone);
      events.push({
        id: `pickup_win:${inst.instanceId}`,
        type: "pickup",
        title: label,
        startsAt: inst.startsAt,
        endsAt: inst.endsAt,
        allDay: false,
        status: null,
        sourceType: "pickup_window",
        sourceId: w.id,
        href: "/dashboard/fulfilment/pickup",
        editHref: "/dashboard/fulfilment/pickup",
        location: w.pickupLocation?.publicLabel ?? null,
        summary: "Pickup window",
        dayKey: dk,
        sortKey: inst.startsAt.toISOString(),
        metadata: { instanceKey: inst.instanceId },
        editable: true,
        durationEditable: true,
        rescheduleAction: "pickup_window",
      });
    }
  }

  for (const z of deliveryZones) {
    for (const inst of expandDeliveryZoneInstances(z, input.start, input.end)) {
      const dk = dayKeyInTz(inst.startsAt, z.timezone);
      events.push({
        id: `delivery_win:${inst.instanceId}`,
        type: "delivery",
        title: z.name,
        startsAt: inst.startsAt,
        endsAt: inst.endsAt,
        allDay: false,
        status: null,
        sourceType: "delivery_zone",
        sourceId: z.id,
        href: "/dashboard/fulfilment/delivery",
        editHref: "/dashboard/fulfilment/delivery",
        location: null,
        summary: "Delivery window",
        dayKey: dk,
        sortKey: inst.startsAt.toISOString(),
        metadata: { instanceKey: inst.instanceId },
        editable: true,
        durationEditable: true,
        rescheduleAction: "delivery_zone",
      });
    }
  }

  return events;
}
