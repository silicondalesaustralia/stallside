import type { CalendarWeekResponse, MobileCalendarEvent } from "@/contracts/mobile/calendar";
import { CALENDAR_TYPE_LABEL, type CalendarEvent } from "@/lib/calendar/types";
import type { loadOwnerCalendarWeek } from "@/lib/calendar/week";
import { categoryForEventType } from "@/lib/unified-calendar/categories";

type Week = Awaited<ReturnType<typeof loadOwnerCalendarWeek>>;

function timeLabel(event: CalendarEvent, timeZone: string): string {
  if (event.allDay) return "All day";
  const format = new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" });
  const start = format.format(event.startsAt);
  return event.endsAt ? `${start} – ${format.format(event.endsAt)}` : start;
}

function dayLabel(dayKey: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dayKey}T12:00:00Z`));
}

function toMobileEvent(event: CalendarEvent, timeZone: string): MobileCalendarEvent | null {
  const category = categoryForEventType(event.type);
  if (category === "social") return null;
  return {
    id: event.id,
    category,
    typeLabel: CALENDAR_TYPE_LABEL[event.type],
    title: event.title,
    timeLabel: timeLabel(event, timeZone),
    status: event.status,
    location: event.location,
    summary: event.summary,
    href: event.href,
  };
}

export function toCalendarWeek(week: Week): CalendarWeekResponse {
  const sorted = [...week.events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return {
    heading: week.heading,
    timeZone: week.timeZone,
    weekStart: week.weekStart,
    previousWeek: week.previousWeek,
    nextWeek: week.nextWeek,
    today: week.today,
    days: week.dayKeys.map((dayKey) => ({
      dayKey,
      label: dayLabel(dayKey),
      events: sorted
        .filter((event) => event.dayKey === dayKey)
        .flatMap((event) => toMobileEvent(event, week.timeZone) ?? []),
    })),
  };
}
