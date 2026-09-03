import type { CalendarEvent, CalendarEventType } from "./types";

const DEFAULT_TIMED_MS = 2 * 60 * 60 * 1000;

function resolveTimedEnd(
  startsAt: Date,
  endsAt: Date | null,
  allDay: boolean,
): Date | null {
  if (allDay) return null;
  if (endsAt && endsAt > startsAt) return endsAt;
  return new Date(startsAt.getTime() + DEFAULT_TIMED_MS);
}

const TYPE_COLORS: Record<
  CalendarEventType,
  { bg: string; border: string; text: string }
> = {
  menu_open: { bg: "#fef3c7", border: "#f59e0b", text: "#78350f" },
  menu_close: { bg: "#fef3c7", border: "#d97706", text: "#78350f" },
  production: { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  packing: { bg: "#e0e7ff", border: "#6366f1", text: "#312e81" },
  pickup: { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  delivery: { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
  subscription: { bg: "#fce7f3", border: "#ec4899", text: "#831843" },
  custom_order: { bg: "#ffedd5", border: "#f97316", text: "#7c2d12" },
  market: { bg: "#dcfce7", border: "#22c55e", text: "#14532d" },
};

export type FcEventInput = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  url?: string;
  editable: boolean;
  durationEditable: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames: string[];
  extendedProps: {
    type: CalendarEventType;
    href: string;
    summary: string | null;
    rescheduleAction: CalendarEvent["rescheduleAction"];
    sourceId: string;
    metadata: CalendarEvent["metadata"];
  };
};

export function calendarEventToFc(event: CalendarEvent): FcEventInput {
  const colors = TYPE_COLORS[event.type];
  const end = resolveTimedEnd(event.startsAt, event.endsAt, event.allDay);
  return {
    id: event.id,
    title: event.title,
    start: event.startsAt.toISOString(),
    end: end?.toISOString(),
    allDay: event.allDay,
    url: event.href,
    editable: event.editable,
    durationEditable: event.durationEditable,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    textColor: colors.text,
    classNames: [`cal-type-${event.type}`, event.editable ? "cal-editable" : "cal-readonly"],
    extendedProps: {
      type: event.type,
      href: event.href,
      summary: event.summary,
      rescheduleAction: event.rescheduleAction,
      sourceId: event.sourceId,
      metadata: event.metadata,
    },
  };
}

export function fcEventsFromCalendar(events: CalendarEvent[]): FcEventInput[] {
  return events.map(calendarEventToFc);
}
