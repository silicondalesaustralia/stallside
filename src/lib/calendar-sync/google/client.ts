import { zonedWallClockToUtc } from "@/lib/stand-timezone";
import { dayKeyInTz } from "@/lib/calendar/range";
import { refreshGoogleAccessToken } from "./oauth";
import { googleCalendarFetch } from "./http";
import type { CalendarProviderClient, ProviderEvent, ProviderEventInput } from "../types";

const MAX_PAGES = 4;

type GoogleTime = { dateTime?: string; date?: string };
type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: GoogleTime;
  end?: GoogleTime;
};
type GoogleEventList = { items?: GoogleEvent[]; nextPageToken?: string };

function dateKeyToUtc(key: string, timeZone: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return zonedWallClockToUtc(y, m - 1, d, 0, 0, 0, timeZone);
}

function nextDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function toProviderEvent(e: GoogleEvent, timeZone: string): ProviderEvent | null {
  if (e.status === "cancelled" || !e.start) return null;
  const allDay = Boolean(e.start.date && !e.start.dateTime);
  const startRaw = e.start.dateTime ?? e.start.date;
  if (!startRaw) return null;
  const startsAt = allDay ? dateKeyToUtc(startRaw, timeZone) : new Date(startRaw);
  const endRaw = e.end?.dateTime ?? e.end?.date;
  const endsAt = endRaw ? (allDay ? dateKeyToUtc(endRaw, timeZone) : new Date(endRaw)) : null;
  return {
    id: e.id,
    title: e.summary?.trim() || "(busy)",
    startsAt,
    endsAt,
    allDay,
    location: e.location?.trim() || null,
    htmlLink: e.htmlLink ?? null,
  };
}

function toGoogleBody(input: ProviderEventInput) {
  if (input.allDay) {
    const day = dayKeyInTz(input.startsAt, input.timeZone);
    const endDay = input.endsAt ? dayKeyInTz(input.endsAt, input.timeZone) : day;
    return {
      summary: input.title,
      description: input.description,
      location: input.location ?? undefined,
      start: { date: day },
      end: { date: nextDayKey(endDay > day ? endDay : day) },
    };
  }
  const end = input.endsAt && input.endsAt > input.startsAt
    ? input.endsAt
    : new Date(input.startsAt.getTime() + 60 * 60 * 1000);
  return {
    summary: input.title,
    description: input.description,
    location: input.location ?? undefined,
    start: { dateTime: input.startsAt.toISOString(), timeZone: input.timeZone },
    end: { dateTime: end.toISOString(), timeZone: input.timeZone },
  };
}

export const googleCalendarClient: CalendarProviderClient = {
  refreshAccessToken: refreshGoogleAccessToken,

  async listEvents(accessToken, start, end, timeZone) {
    const events: ProviderEvent[] = [];
    let pageToken: string | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
      const data = await googleCalendarFetch<GoogleEventList>(accessToken, "/calendars/primary/events", {
        query: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "250",
          ...(pageToken ? { pageToken } : {}),
        },
      });
      for (const item of data?.items ?? []) {
        const mapped = toProviderEvent(item, timeZone);
        if (mapped) events.push(mapped);
      }
      pageToken = data?.nextPageToken;
      if (!pageToken) break;
    }
    return events;
  },

  async createExportCalendar(accessToken, name, timeZone) {
    const created = await googleCalendarFetch<{ id: string }>(accessToken, "/calendars", {
      method: "POST",
      body: { summary: name, timeZone },
    });
    if (!created?.id) throw new Error("Google did not return a calendar id");
    return created.id;
  },

  async createEvent(accessToken, calendarId, input) {
    const created = await googleCalendarFetch<{ id: string }>(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      { method: "POST", body: toGoogleBody(input) },
    );
    if (!created?.id) throw new Error("Google did not return an event id");
    return created.id;
  },

  async updateEvent(accessToken, calendarId, eventId, input) {
    await googleCalendarFetch(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: "PUT", body: toGoogleBody(input) },
    );
  },

  async deleteEvent(accessToken, calendarId, eventId) {
    await googleCalendarFetch(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE" },
    );
  },
};
