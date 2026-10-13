import type { CalendarEventType, CalendarView } from "@/lib/calendar/types";
import { CALENDAR_FILTER_TYPES } from "@/lib/calendar/types";
import { parseAnchorDate } from "@/lib/calendar/range";

export function parseCalendarTypes(raw: string | undefined): CalendarEventType[] {
  if (!raw?.trim()) return [];
  const allowed = new Set<string>(CALENDAR_FILTER_TYPES);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is CalendarEventType => allowed.has(s));
}

export function parseCalendarView(raw: string | undefined): CalendarView {
  if (raw === "month" || raw === "agenda") return raw;
  return "week";
}

export function resolveCalendarAnchor(
  rawDate: string | undefined,
  timeZone: string,
): Date {
  return parseAnchorDate(rawDate, timeZone);
}
