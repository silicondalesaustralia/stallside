import { zonedWallClockToUtc } from "@/lib/stand-timezone";
import type { CalendarView } from "./types";

export function dayKeyInTz(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function parseAnchorDate(raw: string | undefined, timeZone: string): Date {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return zonedWallClockToUtc(y, m - 1, d, 12, 0, 0, timeZone);
  }
  return new Date();
}

export function addDaysInTz(anchor: Date, days: number, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(anchor);
  const num = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value);
  const y = num("year");
  const m = num("month");
  const d = num("day");
  const base = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  const key = dayKeyInTz(base, timeZone);
  const [yy, mm, dd] = key.split("-").map(Number);
  return zonedWallClockToUtc(yy, mm - 1, dd, 0, 0, 0, timeZone);
}

/** Monday-start week in seller timezone. */
export function weekRange(
  anchor: Date,
  timeZone: string,
): { start: Date; end: Date; days: Date[] } {
  const key = dayKeyInTz(anchor, timeZone);
  const [y, m, d] = key.split("-").map(Number);
  const noon = zonedWallClockToUtc(y, m - 1, d, 12, 0, 0, timeZone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(noon);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = map[weekday] ?? 0;
  const start = addDaysInTz(noon, -offset, timeZone);
  const days = Array.from({ length: 7 }, (_, i) => addDaysInTz(start, i, timeZone));
  const end = addDaysInTz(start, 7, timeZone);
  return { start, end, days };
}

export function monthRange(
  anchor: Date,
  timeZone: string,
): { start: Date; end: Date; weeks: Date[][] } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(anchor);
  const num = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value);
  const y = num("year");
  const m = num("month");
  const start = zonedWallClockToUtc(y, m - 1, 1, 0, 0, 0, timeZone);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = zonedWallClockToUtc(y, m - 1, lastDay + 1, 0, 0, 0, timeZone);
  const { days: firstWeek } = weekRange(start, timeZone);
  const weeks: Date[][] = [];
  let cursor = firstWeek[0];
  while (cursor < end) {
    const w = weekRange(cursor, timeZone);
    weeks.push(w.days);
    cursor = addDaysInTz(w.start, 7, timeZone);
  }
  return { start, end, weeks };
}

export function agendaRange(
  anchor: Date,
  timeZone: string,
  days = 14,
): { start: Date; end: Date } {
  const key = dayKeyInTz(anchor, timeZone);
  const [y, m, d] = key.split("-").map(Number);
  const start = zonedWallClockToUtc(y, m - 1, d, 0, 0, 0, timeZone);
  const end = addDaysInTz(start, days, timeZone);
  return { start, end };
}

export function resolveVisibleRange(
  view: CalendarView,
  anchor: Date,
  timeZone: string,
): { start: Date; end: Date; weekDays?: Date[]; monthWeeks?: Date[][] } {
  if (view === "week") {
    const w = weekRange(anchor, timeZone);
    return { start: w.start, end: w.end, weekDays: w.days };
  }
  if (view === "month") {
    const m = monthRange(anchor, timeZone);
    return { start: m.start, end: m.end, monthWeeks: m.weeks };
  }
  const a = agendaRange(anchor, timeZone);
  return { start: a.start, end: a.end };
}

export function formatAnchorParam(d: Date, timeZone: string): string {
  return dayKeyInTz(d, timeZone);
}

export function formatTimeRange(
  startsAt: Date,
  endsAt: Date | null,
  timeZone: string,
  allDay: boolean,
): string {
  if (allDay) return "All day";
  const opts: Intl.DateTimeFormatOptions = {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  };
  const start = new Intl.DateTimeFormat("en-AU", opts).format(startsAt);
  if (!endsAt) return start;
  const end = new Intl.DateTimeFormat("en-AU", opts).format(endsAt);
  return `${start}–${end}`;
}

export function formatDayHeading(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function defaultViewForBusinessMode(
  mode: string | null | undefined,
): CalendarView {
  if (mode === "FARM_STAND") return "agenda";
  return "week";
}
