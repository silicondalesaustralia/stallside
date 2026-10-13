import { dayKeyInTz } from "@/lib/calendar/range";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  activeAccessToken,
  calendarProviderClient,
  listCalendarConnections,
  recordCalendarError,
} from "./connection";
import type { ProviderEvent } from "./types";

function toCalendarEvent(
  connectionId: string,
  e: ProviderEvent,
  timeZone: string,
): CalendarEvent {
  return {
    id: `external:${connectionId}:${e.id}`,
    type: "external",
    title: e.title,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    allDay: e.allDay,
    status: null,
    sourceType: "external_calendar",
    sourceId: e.id,
    href: e.htmlLink ?? "/dashboard/social/connections",
    editHref: null,
    location: e.location,
    summary: e.location,
    dayKey: dayKeyInTz(e.startsAt, timeZone),
    sortKey: e.startsAt.toISOString(),
    metadata: {},
    editable: false,
    durationEditable: false,
    rescheduleAction: null,
  };
}

/**
 * The owner's own events from every connected calendar, for the visible range.
 * Read live; a provider failure is recorded on the connection and never breaks the page.
 */
export async function projectExternalCalendarEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
}): Promise<CalendarEvent[]> {
  let connections;
  try {
    connections = await listCalendarConnections(input.ownerId);
  } catch (err) {
    console.error("[calendar-sync] could not load connections", err);
    return [];
  }

  const perConnection = await Promise.all(
    connections
      .filter((c) => c.importEnabled)
      .map(async (conn) => {
        const client = calendarProviderClient(conn.provider);
        if (!client) return [];
        try {
          const token = await activeAccessToken(conn);
          const events = await client.listEvents(token, input.start, input.end, input.timeZone);
          return events.map((e) => toCalendarEvent(conn.id, e, input.timeZone));
        } catch (err) {
          console.error(`[calendar-sync] import failed for ${conn.provider}`, err);
          await recordCalendarError(conn.id, err);
          return [];
        }
      }),
  );
  return perConnection.flat();
}
