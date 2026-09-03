import { PickupWindowRecurrence } from "@/generated/prisma/client";
import { zonedWallClockToUtc } from "@/lib/stand-timezone";
import { addDaysInTz, dayKeyInTz } from "./range";
import { weekdayInTz } from "./tz-utils";

export type WindowInstance = {
  instanceId: string;
  startsAt: Date;
  endsAt: Date;
};

export function eachDayInRange(
  start: Date,
  end: Date,
  timeZone: string,
): Date[] {
  const days: Date[] = [];
  let cur = start;
  while (cur < end) {
    days.push(cur);
    cur = addDaysInTz(cur, 1, timeZone);
  }
  return days;
}

function instanceFromTimeMins(
  dayAnchor: Date,
  startMin: number,
  endMin: number,
  timeZone: string,
): { startsAt: Date; endsAt: Date } {
  const dk = dayKeyInTz(dayAnchor, timeZone);
  const [y, m, d] = dk.split("-").map(Number);
  const startsAt = zonedWallClockToUtc(
    y,
    m - 1,
    d,
    Math.floor(startMin / 60),
    startMin % 60,
    0,
    timeZone,
  );
  const endsAt = zonedWallClockToUtc(
    y,
    m - 1,
    d,
    Math.floor(endMin / 60),
    endMin % 60,
    0,
    timeZone,
  );
  return { startsAt, endsAt };
}

export function expandPickupWindowInstances(
  window: {
    id: string;
    recurrence: PickupWindowRecurrence;
    timezone: string;
    weekday: number | null;
    startTimeMin: number | null;
    endTimeMin: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
  },
  rangeStart: Date,
  rangeEnd: Date,
): WindowInstance[] {
  const tz = window.timezone;

  if (
    window.recurrence === PickupWindowRecurrence.ONE_OFF &&
    window.startsAt
  ) {
    if (window.startsAt >= rangeStart && window.startsAt < rangeEnd) {
      const end =
        window.endsAt ??
        new Date(window.startsAt.getTime() + 60 * 60 * 1000);
      return [
        {
          instanceId: `${window.id}:one`,
          startsAt: window.startsAt,
          endsAt: end,
        },
      ];
    }
    return [];
  }

  if (
    window.recurrence === PickupWindowRecurrence.WEEKLY &&
    window.weekday != null &&
    window.startTimeMin != null
  ) {
    const endMin = window.endTimeMin ?? window.startTimeMin + 60;
    const out: WindowInstance[] = [];
    for (const day of eachDayInRange(rangeStart, rangeEnd, tz)) {
      if (weekdayInTz(day, tz) !== window.weekday) continue;
      const dk = dayKeyInTz(day, tz);
      const { startsAt, endsAt } = instanceFromTimeMins(
        day,
        window.startTimeMin,
        endMin,
        tz,
      );
      if (startsAt >= rangeEnd || endsAt <= rangeStart) continue;
      out.push({ instanceId: `${window.id}:${dk}`, startsAt, endsAt });
    }
    return out;
  }

  return [];
}

export function expandDeliveryZoneInstances(
  zone: {
    id: string;
    timezone: string;
    weekday: number | null;
    startTimeMin: number | null;
    endTimeMin: number | null;
  },
  rangeStart: Date,
  rangeEnd: Date,
): WindowInstance[] {
  const tz = zone.timezone;
  if (zone.weekday == null || zone.startTimeMin == null) return [];

  const endMin = zone.endTimeMin ?? zone.startTimeMin + 120;
  const out: WindowInstance[] = [];

  for (const day of eachDayInRange(rangeStart, rangeEnd, tz)) {
    if (weekdayInTz(day, tz) !== zone.weekday) continue;
    const dk = dayKeyInTz(day, tz);
    const { startsAt, endsAt } = instanceFromTimeMins(
      day,
      zone.startTimeMin,
      endMin,
      tz,
    );
    if (startsAt >= rangeEnd || endsAt <= rangeStart) continue;
    out.push({ instanceId: `${zone.id}:${dk}`, startsAt, endsAt });
  }

  return out;
}
