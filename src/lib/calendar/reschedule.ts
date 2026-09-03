import {
  CustomOrderFieldType,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CalendarRescheduleAction } from "./types";
import { timeMinInTz, weekdayInTz } from "./tz-utils";

export type RescheduleInput = {
  ownerId: string;
  action: CalendarRescheduleAction;
  sourceId: string;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  metadata?: Record<string, string | number | boolean | null>;
};

export type RescheduleResult =
  | { ok: true }
  | { ok: false; error: string };

export async function rescheduleCalendarEvent(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  switch (input.action) {
    case "menu_close":
      return rescheduleMenuClose(input);
    case "market":
      return rescheduleMarketEvent(input);
    case "custom_order":
      return rescheduleCustomOrderDueDate(input);
    case "pickup_window":
      return reschedulePickupWindow(input);
    case "delivery_zone":
      return rescheduleDeliveryWindow(input);
    default:
      return { ok: false, error: "This event cannot be rescheduled from the calendar." };
  }
}

async function rescheduleMenuClose(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  const menu = await prisma.menu.findFirst({
    where: { id: input.sourceId, ownerId: input.ownerId },
    select: { id: true },
  });
  if (!menu) return { ok: false, error: "Menu not found." };

  await prisma.menu.update({
    where: { id: menu.id },
    data: { orderByAt: input.startsAt },
  });
  return { ok: true };
}

async function rescheduleMarketEvent(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  const event = await prisma.sellerEvent.findFirst({
    where: { id: input.sourceId, ownerId: input.ownerId },
    select: { id: true },
  });
  if (!event) return { ok: false, error: "Event not found." };

  if (input.endsAt && input.endsAt <= input.startsAt) {
    return { ok: false, error: "End time must be after start." };
  }

  await prisma.sellerEvent.update({
    where: { id: event.id },
    data: {
      startsAt: input.startsAt,
      endsAt: input.allDay ? null : input.endsAt,
    },
  });
  return { ok: true };
}

async function rescheduleCustomOrderDueDate(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  const request = await prisma.customOrderRequest.findFirst({
    where: { id: input.sourceId, ownerId: input.ownerId },
    include: {
      form: { select: { fields: { select: { label: true, fieldType: true } } } },
    },
  });
  if (!request) return { ok: false, error: "Custom order not found." };

  const preferredLabel =
    typeof input.metadata?.dateFieldLabel === "string"
      ? input.metadata.dateFieldLabel
      : null;

  const dateFields = request.form.fields.filter(
    (f) => f.fieldType === CustomOrderFieldType.DATE,
  );
  const fieldLabel =
    preferredLabel && dateFields.some((f) => f.label === preferredLabel)
      ? preferredLabel
      : dateFields[0]?.label;

  if (!fieldLabel) {
    return { ok: false, error: "No date field on this form." };
  }

  const answers =
    request.answers &&
    typeof request.answers === "object" &&
    !Array.isArray(request.answers)
      ? { ...(request.answers as Record<string, string>) }
      : {};

  const iso = input.allDay
    ? input.startsAt.toISOString().slice(0, 10)
    : input.startsAt.toISOString();
  answers[fieldLabel] = iso;

  await prisma.customOrderRequest.update({
    where: { id: request.id },
    data: { answers },
  });
  return { ok: true };
}

async function reschedulePickupWindow(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  const window = await prisma.pickupWindow.findFirst({
    where: { id: input.sourceId, ownerId: input.ownerId },
    select: {
      id: true,
      recurrence: true,
      timezone: true,
    },
  });
  if (!window) return { ok: false, error: "Pickup window not found." };

  const tz = window.timezone;
  const end = input.endsAt ?? new Date(input.startsAt.getTime() + 60 * 60 * 1000);

  if (window.recurrence === PickupWindowRecurrence.ONE_OFF) {
    await prisma.pickupWindow.update({
      where: { id: window.id },
      data: { startsAt: input.startsAt, endsAt: end },
    });
    return { ok: true };
  }

  const weekday = weekdayInTz(input.startsAt, tz);
  const startTimeMin = timeMinInTz(input.startsAt, tz);
  const endTimeMin = timeMinInTz(end, tz);

  if (endTimeMin <= startTimeMin) {
    return { ok: false, error: "End time must be after start." };
  }

  await prisma.pickupWindow.update({
    where: { id: window.id },
    data: { weekday, startTimeMin, endTimeMin },
  });
  return { ok: true };
}

async function rescheduleDeliveryWindow(
  input: RescheduleInput,
): Promise<RescheduleResult> {
  const zone = await prisma.deliveryZone.findFirst({
    where: { id: input.sourceId, ownerId: input.ownerId },
    select: { id: true, timezone: true },
  });
  if (!zone) return { ok: false, error: "Delivery zone not found." };

  const tz = zone.timezone;
  const end = input.endsAt ?? new Date(input.startsAt.getTime() + 2 * 60 * 60 * 1000);

  const weekday = weekdayInTz(input.startsAt, tz);
  const startTimeMin = timeMinInTz(input.startsAt, tz);
  const endTimeMin = timeMinInTz(end, tz);

  if (endTimeMin <= startTimeMin) {
    return { ok: false, error: "End time must be after start." };
  }

  await prisma.deliveryZone.update({
    where: { id: zone.id },
    data: { weekday, startTimeMin, endTimeMin },
  });
  return { ok: true };
}
