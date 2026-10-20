import { resolveStandTimezone } from "@/lib/stand-timezone";
import { dateKeyInTimeZone, localDateTimeToUtc } from "@/lib/utils/australiaSydneyTime";
import { addDaysToDateKey, mondayOfWeekContaining, weekDateRange } from "@/lib/social/weekPlan/weekIdentity";
import { formatCalendarWeekHeading } from "@/lib/social/socialCalendar";
import { loadCalendarEvents } from "./load";

/** One Monday-to-Sunday week of the owner's operations calendar, incl. their Google / Outlook events. */
export async function loadOwnerCalendarWeek(ownerId: string, defaultTimezone: string | null, date?: string) {
  const timeZone = resolveStandTimezone(defaultTimezone);
  const today = dateKeyInTimeZone(new Date(), timeZone);
  const weekStart = mondayOfWeekContaining(date ?? today, timeZone);
  const dayKeys = weekDateRange(weekStart, timeZone);
  const events = await loadCalendarEvents({
    ownerId,
    start: localDateTimeToUtc(weekStart, "00:00", timeZone),
    end: localDateTimeToUtc(addDaysToDateKey(weekStart, 7, timeZone), "00:00", timeZone),
    timeZone,
    includeExternal: true,
  });
  return {
    timeZone,
    today,
    weekStart,
    dayKeys,
    heading: formatCalendarWeekHeading(weekStart, timeZone),
    previousWeek: addDaysToDateKey(weekStart, -7, timeZone),
    nextWeek: addDaysToDateKey(weekStart, 7, timeZone),
    events,
  };
}
