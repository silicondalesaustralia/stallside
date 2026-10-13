import Link from "next/link";
import {
  addDaysInTz,
  dayKeyInTz,
  formatAnchorParam,
  formatDayHeading,
} from "@/lib/calendar/range";
import { zonedWallClockToUtc } from "@/lib/stand-timezone";
import type { CalendarEvent } from "@/lib/calendar/types";
import { CalendarEventList } from "./CalendarEventCard";

export default function CalendarWeekView({
  days,
  events,
  timeZone,
  anchor,
}: {
  days: Date[];
  events: CalendarEvent[];
  timeZone: string;
  anchor: Date;
}) {
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = byDay.get(e.dayKey) ?? [];
    list.push(e);
    byDay.set(e.dayKey, list);
  }

  const todayKey = dayKeyInTz(new Date(), timeZone);

  return (
    <>
      <div className="hidden gap-2 lg:grid lg:grid-cols-7">
        {days.map((d) => {
          const dk = dayKeyInTz(d, timeZone);
          const dayEvents = byDay.get(dk) ?? [];
          const isToday = dk === todayKey;
          return (
            <div
              key={dk}
              className={`min-h-[8rem] rounded-xl border p-2 ${isToday ? "border-[var(--leaf)] bg-[var(--wash)]" : "border-[var(--line)] bg-white"}`}
            >
              <p className="text-xs font-semibold text-[var(--muted)]">
                {formatDayHeading(d, timeZone).split(",")[0]}
              </p>
              <p className="text-sm font-bold">{dk.slice(8)}</p>
              {dayEvents.length > 3 ? (
                <>
                  <CalendarEventList
                    events={dayEvents.slice(0, 2)}
                    timeZone={timeZone}
                    compact
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    +{dayEvents.length - 2} more
                  </p>
                </>
              ) : (
                <CalendarEventList
                  events={dayEvents}
                  timeZone={timeZone}
                  compact
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const dk = dayKeyInTz(d, timeZone);
            const isToday = dk === todayKey;
            const isAnchor = dk === formatAnchorParam(anchor, timeZone);
            return (
              <Link
                key={dk}
                href={`?view=week&date=${dk}`}
                className={`shrink-0 rounded-lg border px-3 py-2 text-center text-xs font-semibold ${isAnchor || isToday ? "border-[var(--leaf)] bg-[var(--wash)]" : "border-[var(--line)]"}`}
              >
                {formatDayHeading(d, timeZone).split(" ")[0]}
                <br />
                {dk.slice(8)}
              </Link>
            );
          })}
        </div>
        <section>
          <h2 className="text-lg font-semibold">
            {formatDayHeading(anchor, timeZone)}
          </h2>
          <div className="mt-3">
            <CalendarEventList
              events={byDay.get(formatAnchorParam(anchor, timeZone)) ?? []}
              timeZone={timeZone}
            />
          </div>
        </section>
      </div>
    </>
  );
}

export function CalendarAgendaView({
  events,
  timeZone,
  start,
}: {
  events: CalendarEvent[];
  timeZone: string;
  start: Date;
}) {
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = byDay.get(e.dayKey) ?? [];
    list.push(e);
    byDay.set(e.dayKey, list);
  }
  const keys = [...byDay.keys()].sort();

  if (keys.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Nothing scheduled in this period.
      </p>
    );
  }

  const todayKey = dayKeyInTz(new Date(), timeZone);
  const tomorrowKey = dayKeyInTz(addDaysInTz(start, 1, timeZone), timeZone);

  return (
    <div className="flex flex-col gap-6">
      {keys.map((dk) => {
        const label =
          dk === todayKey
            ? "Today"
            : dk === tomorrowKey
              ? "Tomorrow"
              : (() => {
                  const [y, m, d] = dk.split("-").map(Number);
                  return formatDayHeading(
                    zonedWallClockToUtc(y, m - 1, d, 12, 0, 0, timeZone),
                    timeZone,
                  );
                })();
        return (
          <section key={dk}>
            <h2 className="text-lg font-semibold">{label}</h2>
            <div className="mt-2">
              <CalendarEventList
                events={byDay.get(dk) ?? []}
                timeZone={timeZone}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function CalendarMonthView({
  weeks,
  events,
  timeZone,
}: {
  weeks: Date[][];
  events: CalendarEvent[];
  timeZone: string;
}) {
  const byDay = new Map<string, number>();
  for (const e of events) {
    byDay.set(e.dayKey, (byDay.get(e.dayKey) ?? 0) + 1);
  }
  const todayKey = dayKeyInTz(new Date(), timeZone);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--muted)]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d) => {
              const dk = dayKeyInTz(d, timeZone);
              const count = byDay.get(dk) ?? 0;
              const isToday = dk === todayKey;
              return (
                <Link
                  key={dk}
                  href={`?view=agenda&date=${dk}`}
                  className={`min-h-[4.5rem] rounded-lg border p-1.5 text-left text-xs ${isToday ? "border-[var(--leaf)] bg-[var(--wash)]" : "border-[var(--line)] bg-white"}`}
                >
                  <span className="font-bold">{Number(dk.slice(8))}</span>
                  {count > 0 ? (
                    <p className="mt-1 text-[10px] font-semibold text-[var(--leaf-dark)]">
                      {count} item{count === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
