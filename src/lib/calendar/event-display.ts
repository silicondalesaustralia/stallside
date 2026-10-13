import { isMidnightInTz } from "./tz-utils";

const DEFAULT_TIMED_MS = 2 * 60 * 60 * 1000;

/** Timed events need an end for the week time grid. */
export function resolveTimedEnd(
  startsAt: Date,
  endsAt: Date | null,
  allDay: boolean,
): Date | null {
  if (allDay) return null;
  if (endsAt && endsAt > startsAt) return endsAt;
  return new Date(startsAt.getTime() + DEFAULT_TIMED_MS);
}

export function resolveMarketAllDay(
  startsAt: Date,
  endsAt: Date | null,
  timeZone: string,
): boolean {
  if (endsAt) return false;
  return isMidnightInTz(startsAt, timeZone);
}
