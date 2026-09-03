"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import listPlugin from "@fullcalendar/react/list";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import { dayKeyInTz } from "@/lib/calendar/range";
import type { CalendarView } from "@/lib/calendar/types";
import { fcEventsFromCalendar } from "@/lib/calendar/fc-map";
import type { CalendarEvent } from "@/lib/calendar/types";
import { rescheduleCalendarEventAction } from "./actions";
import { toDateTimeLocalInTz } from "@/lib/stand-timezone";

type FcExtended = {
  type: CalendarEvent["type"];
  href: string;
  summary: string | null;
  rescheduleAction: CalendarEvent["rescheduleAction"];
  sourceId: string;
  metadata: CalendarEvent["metadata"];
};

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

type CreateSlot = {
  start: Date;
  end: Date;
  allDay: boolean;
};

function fcViewId(view: CalendarView): string {
  switch (view) {
    case "month":
      return "dayGridMonth";
    case "week":
      return "timeGridWeek";
    case "agenda":
      return "listWeek";
  }
}

function viewFromFcId(id: string): CalendarView {
  if (id.startsWith("dayGrid")) return "month";
  if (id.startsWith("timeGrid")) return "week";
  return "agenda";
}

export default function CalendarScheduler({
  events,
  view,
  anchorDate,
  timeZone,
}: {
  events: CalendarEvent[];
  view: CalendarView;
  anchorDate: string;
  timeZone: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const syncingRef = useRef(false);

  const fcEvents = useMemo(() => fcEventsFromCalendar(events), [events]);

  const pushParams = useCallback(
    (nextView: CalendarView, dateKey: string) => {
      if (syncingRef.current) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      params.set("date", dateKey);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const persistReschedule = useCallback(
    async (
      eventId: string,
      start: Date,
      end: Date | null,
      allDay: boolean,
      extended: (typeof fcEvents)[number]["extendedProps"],
    ) => {
      if (!extended.rescheduleAction) {
        setError("This item is derived from orders — edit fulfilment or the source record instead.");
        return false;
      }
      setError(null);
      const result = await rescheduleCalendarEventAction({
        rescheduleAction: extended.rescheduleAction,
        sourceId: extended.sourceId,
        startsAt: start.toISOString(),
        endsAt: end?.toISOString() ?? null,
        allDay,
        metadata: extended.metadata,
      });
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      startTransition(() => router.refresh());
      return true;
    },
    [router],
  );

  const handleEventDrop = useCallback(
    async (info: {
      event: {
        id: string;
        start: Date | null;
        end: Date | null;
        allDay: boolean;
        extendedProps: Record<string, unknown>;
      };
      oldEvent: { start: Date | null };
      revert: () => void;
    }) => {
      const ext = info.event.extendedProps as FcExtended;
      const ok = await persistReschedule(
        info.event.id,
        info.event.start ?? info.oldEvent.start!,
        info.event.end,
        info.event.allDay,
        ext,
      );
      if (!ok) info.revert();
    },
    [persistReschedule],
  );

  const handleEventResize = useCallback(
    async (info: {
      event: {
        id: string;
        start: Date | null;
        end: Date | null;
        allDay: boolean;
        extendedProps: Record<string, unknown>;
      };
      revert: () => void;
    }) => {
      const ext = info.event.extendedProps as FcExtended;
      const ok = await persistReschedule(
        info.event.id,
        info.event.start!,
        info.event.end,
        info.event.allDay,
        ext,
      );
      if (!ok) info.revert();
    },
    [persistReschedule],
  );

  const handleEventClick = useCallback(
    (info: { event: { extendedProps: { href?: string } }; jsEvent: MouseEvent }) => {
      const href = info.event.extendedProps.href as string | undefined;
      if (href && !info.jsEvent.metaKey && !info.jsEvent.ctrlKey) {
        info.jsEvent.preventDefault();
        router.push(href);
      }
    },
    [router],
  );

  const renderEventContent = useCallback(
    (arg: {
      event: { title: string; extendedProps: Record<string, unknown> };
      timeText: string;
    }) => {
      const ext = arg.event.extendedProps as FcExtended;
      const detail = ext.summary
        ? `${arg.event.title} · ${ext.summary}`
        : arg.event.title;
      const text = arg.timeText ? `${arg.timeText} ${detail}` : detail;
      return (
        <div className="vendl-fc-event-inner" title={text}>
          {text}
        </div>
      );
    },
    [],
  );

  return (
    <div className="vendl-calendar flex flex-col gap-3">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <Calendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin,
          classicThemePlugin,
        ]}
        initialView={fcViewId(view)}
        initialDate={anchorDate}
        timeZone={timeZone}
        height="auto"
        contentHeight={view === "week" ? 720 : undefined}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        events={fcEvents}
        editable
        eventStartEditable
        eventDurationEditable
        eventDrop={(info) => {
          void handleEventDrop(info);
        }}
        eventResize={(info) => {
          void handleEventResize(info);
        }}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        eventDidMount={(info) => {
          info.el.style.overflow = "hidden";
          info.el.style.maxWidth = "100%";
        }}
        views={{
          dayGridMonth: { eventDisplay: "block" },
        }}
        selectable
        selectMirror
        unselectAuto
        select={(info) => {
          setCreateSlot({
            start: info.start,
            end: info.end,
            allDay: info.allDay,
          });
        }}
        dayMaxEvents={3}
        moreLinkClick={(info) => {
          const d = info.date instanceof Date ? info.date : new Date(String(info.date));
          pushParams("agenda", dayKeyInTz(d, timeZone));
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        scrollTime="07:00:00"
        defaultTimedEventDuration="02:00:00"
        allDaySlot
        nowIndicator
        weekends
        datesSet={(info) => {
          syncingRef.current = true;
          const nextView = viewFromFcId(info.view.type);
          const dk = dayKeyInTz(info.view.currentStart, timeZone);
          pushParams(nextView, dk);
          queueMicrotask(() => {
            syncingRef.current = false;
          });
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
      />

      {createSlot ? (
        <CreateSlotSheet
          slot={createSlot}
          timeZone={timeZone}
          onClose={() => setCreateSlot(null)}
        />
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Drag supported items to reschedule — pickup windows, delivery windows,
        menu close times, markets, and custom-order due dates update the source
        record. Packing and production blocks are read-only (derived from
        orders).
      </p>
    </div>
  );
}

function CreateSlotSheet({
  slot,
  timeZone,
  onClose,
}: {
  slot: CreateSlot;
  timeZone: string;
  onClose: () => void;
}) {
  const startLocal = toDateTimeLocalInTz(slot.start, timeZone);
  const q = encodeURIComponent(startLocal);

  const options = [
    {
      href: `/dashboard/events/new?startsAt=${q}`,
      label: "Market or event",
      hint: "Timed stall, pop-up, or market day",
    },
    {
      href: `/dashboard/menus/new`,
      label: "Pre-order menu / drop",
      hint: "Set order-by and collection in the menu editor",
    },
    {
      href: `/dashboard/forms/new`,
      label: "Custom order form",
      hint: "Collect bespoke requests with a date field",
    },
    {
      href: `/dashboard/fulfilment/pickup`,
      label: "Pickup window",
      hint: "Add or edit recurring pickup times",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="cal-create-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="cal-create-title" className="text-lg font-semibold">
          Schedule something
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {slot.allDay
            ? slot.start.toLocaleDateString(undefined, { timeZone })
            : slot.start.toLocaleString(undefined, { timeZone })}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {options.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                onClick={onClose}
                className="block rounded-xl border border-[var(--line)] px-4 py-3 hover:border-[var(--leaf)]"
              >
                <span className="font-semibold">{o.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {o.hint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--wash)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
