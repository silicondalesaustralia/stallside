/** An event read from the owner's own calendar (shown read-only on the Vendl calendar). */
export type ProviderEvent = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
};

/** A Vendl event written into the provider's "Vendl" calendar. */
export type ProviderEventInput = {
  title: string;
  description: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  timeZone: string;
};

export type ProviderTokenSet = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string[];
};

/** One implementation per provider (Google now; Outlook later). */
export interface CalendarProviderClient {
  refreshAccessToken(refreshToken: string): Promise<ProviderTokenSet>;
  /** All-day events are anchored to midnight in `timeZone` (the stand's zone). */
  listEvents(accessToken: string, start: Date, end: Date, timeZone: string): Promise<ProviderEvent[]>;
  createExportCalendar(accessToken: string, name: string, timeZone: string): Promise<string>;
  createEvent(accessToken: string, calendarId: string, input: ProviderEventInput): Promise<string>;
  updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    input: ProviderEventInput,
  ): Promise<void>;
  deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void>;
}

/** Thrown when the provider rejects our token for good (user revoked access). */
export class CalendarAuthError extends Error {}

/** Thrown when an event or calendar we linked no longer exists at the provider. */
export class CalendarNotFoundError extends Error {}
