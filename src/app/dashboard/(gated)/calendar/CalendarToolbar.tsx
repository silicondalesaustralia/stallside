import Link from "next/link";
import type { CalendarEventType, CalendarView } from "@/lib/calendar/types";
import { CALENDAR_FILTER_TYPES, CALENDAR_TYPE_LABEL } from "@/lib/calendar/types";
import { formatAnchorParam } from "@/lib/calendar/range";

/** Event-type filters; navigation is handled by FullCalendar toolbar. */
export function CalendarToolbar({
  view,
  anchor,
  timeZone,
  activeTypes,
}: {
  view: CalendarView;
  anchor: Date;
  timeZone: string;
  activeTypes: CalendarEventType[];
}) {
  const date = formatAnchorParam(anchor, timeZone);
  const typesParam = activeTypes.length ? `&types=${activeTypes.join(",")}` : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-[var(--muted)]">Jump to</span>
        <Link
          href={`?view=${view}&date=${formatAnchorParam(new Date(), timeZone)}${typesParam}`}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 font-semibold hover:border-[var(--leaf)]"
        >
          Today
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {CALENDAR_FILTER_TYPES.map((t) => {
          const allOn = activeTypes.length === 0;
          const on = allOn || activeTypes.includes(t);
          let next: CalendarEventType[];
          if (allOn) {
            next = CALENDAR_FILTER_TYPES.filter((x) => x !== t);
          } else if (activeTypes.includes(t)) {
            next = activeTypes.filter((x) => x !== t);
          } else {
            next = [...activeTypes, t];
          }
          const href =
            next.length === 0
              ? `?view=${view}&date=${date}`
              : `?view=${view}&date=${date}&types=${next.join(",")}`;
          return (
            <Link
              key={t}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-[var(--field)] text-white" : "border border-[var(--line)] text-[var(--muted)]"}`}
            >
              {CALENDAR_TYPE_LABEL[t]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
