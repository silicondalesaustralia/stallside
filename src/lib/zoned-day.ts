import { zonedParts, zonedWallClockToUtc } from "@/lib/stand-timezone";

export type ZonedYmd = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

export function zonedYmd(date: Date, timeZone: string): ZonedYmd {
  const parts = zonedParts(date, timeZone);
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
  };
}

export function startOfZonedDay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
): Date {
  return zonedWallClockToUtc(year, month - 1, day, 0, 0, 0, timeZone);
}

export function shiftYmd(year: number, month: number, day: number, days: number) {
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function shiftYmdMonths(
  year: number,
  month: number,
  day: number,
  months: number,
) {
  const shifted = new Date(Date.UTC(year, month - 1 + months, day));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function localYmd(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function startOfDay(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }
  const parts = zonedYmd(date, timeZone);
  return startOfZonedDay(parts.year, parts.month, parts.day, timeZone);
}

export function endOfDay(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
  }
  const parts = zonedYmd(date, timeZone);
  const next = shiftYmd(parts.year, parts.month, parts.day, 1);
  return new Date(
    startOfZonedDay(next.year, next.month, next.day, timeZone).getTime() - 1,
  );
}

export function addDays(date: Date, days: number, timeZone?: string): Date {
  if (!timeZone) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
  const parts = zonedYmd(date, timeZone);
  const next = shiftYmd(parts.year, parts.month, parts.day, days);
  return startOfZonedDay(next.year, next.month, next.day, timeZone);
}

export function addMonths(date: Date, months: number, timeZone?: string): Date {
  if (!timeZone) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
  }
  const parts = zonedYmd(date, timeZone);
  const next = shiftYmdMonths(parts.year, parts.month, parts.day, months);
  return startOfZonedDay(next.year, next.month, next.day, timeZone);
}

export function calendarDateValue(date: Date, timeZone?: string): string {
  const parts = timeZone ? zonedYmd(date, timeZone) : localYmd(date);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}
