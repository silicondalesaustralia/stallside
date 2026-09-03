import Link from "next/link";
import type { CalendarEvent } from "@/lib/calendar/types";
import { CALENDAR_TYPE_LABEL } from "@/lib/calendar/types";
import { formatTimeRange } from "@/lib/calendar/range";

const TYPE_BADGE: Record<string, string> = {
  menu_close: "bg-amber-100 text-amber-900",
  menu_open: "bg-amber-50 text-amber-800",
  production: "bg-violet-100 text-violet-900",
  packing: "bg-sky-100 text-sky-900",
  pickup: "bg-emerald-100 text-emerald-900",
  delivery: "bg-blue-100 text-blue-900",
  subscription: "bg-indigo-100 text-indigo-900",
  custom_order: "bg-rose-100 text-rose-900",
  market: "bg-orange-100 text-orange-900",
};

export default function CalendarEventCard({
  event,
  timeZone,
  compact,
}: {
  event: CalendarEvent;
  timeZone: string;
  compact?: boolean;
}) {
  const badge = TYPE_BADGE[event.type] ?? "bg-[var(--line)] text-[var(--field)]";
  const time = formatTimeRange(
    event.startsAt,
    event.endsAt,
    timeZone,
    event.allDay,
  );

  return (
    <Link
      href={event.href}
      className={`block rounded-lg border border-[var(--line)] bg-white p-3 transition hover:border-[var(--leaf)] ${compact ? "text-xs" : "text-sm"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge}`}
        >
          {CALENDAR_TYPE_LABEL[event.type]}
        </span>
        {!event.allDay && !compact ? (
          <span className="text-[var(--muted)]">{time}</span>
        ) : null}
      </div>
      <p className={`mt-1 font-semibold ${compact ? "text-xs" : ""}`}>
        {event.title}
      </p>
      {event.summary ? (
        <p className="mt-0.5 text-[var(--muted)]">{event.summary}</p>
      ) : null}
      {event.location && !compact ? (
        <p className="mt-0.5 text-xs text-[var(--muted)]">{event.location}</p>
      ) : null}
    </Link>
  );
}

export function CalendarEventList({
  events,
  timeZone,
  compact,
}: {
  events: CalendarEvent[];
  timeZone: string;
  compact?: boolean;
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">Nothing on this day.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {events.map((e) => (
        <li key={e.id}>
          <CalendarEventCard event={e} timeZone={timeZone} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
