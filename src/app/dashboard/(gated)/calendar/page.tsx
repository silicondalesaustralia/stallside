import Link from "next/link";
import { Suspense } from "react";
import { requireOwner } from "@/lib/session";
import { resolveStandTimezone } from "@/lib/stand-timezone";
import { loadCalendarEvents } from "@/lib/calendar/load";
import { resolveVisibleRange } from "@/lib/calendar/range";
import { defaultViewForBusinessMode } from "@/lib/calendar/range";
import { formatAnchorParam } from "@/lib/calendar/range";
import { CalendarToolbar } from "./CalendarToolbar";
import CalendarScheduler from "./CalendarScheduler";
import {
  parseCalendarTypes,
  parseCalendarView,
  resolveCalendarAnchor,
} from "./calendar-params";

export default async function OperationsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    date?: string;
    types?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const timeZone = resolveStandTimezone(owner.defaultTimezone);
  const view = sp.view
    ? parseCalendarView(sp.view)
    : defaultViewForBusinessMode(owner.businessMode);
  const anchor = resolveCalendarAnchor(sp.date, timeZone);
  const types = parseCalendarTypes(sp.types);
  const range = resolveVisibleRange(view, anchor, timeZone);

  const events = await loadCalendarEvents({
    ownerId: owner.id,
    start: range.start,
    end: range.end,
    timeZone,
    types: types.length ? types : null,
  });

  const anchorDate = formatAnchorParam(anchor, timeZone);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/operate" className="underline">
            Operate
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Calendar
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Drag pickup windows, menu deadlines, markets and custom orders — changes
          save to the source record. Month and week views on desktop; agenda on
          mobile.
        </p>
      </div>

      <CalendarToolbar
        view={view}
        anchor={anchor}
        timeZone={timeZone}
        activeTypes={types}
      />

      {events.length === 0 ? (
        <section className="dash-card p-6 text-center text-sm text-[var(--muted)]">
          Nothing in this range yet. Click a time slot to schedule, or create a{" "}
          <Link href="/dashboard/menus/new" className="underline">
            menu
          </Link>
          ,{" "}
          <Link href="/dashboard/events/new" className="underline">
            market
          </Link>
          , or{" "}
          <Link href="/dashboard/fulfilment/pickup" className="underline">
            pickup window
          </Link>
          .
        </section>
      ) : null}

      <Suspense fallback={<div className="dash-card h-96 animate-pulse" />}>
        <CalendarScheduler
          events={events}
          view={view}
          anchorDate={anchorDate}
          timeZone={timeZone}
        />
      </Suspense>
    </main>
  );
}
