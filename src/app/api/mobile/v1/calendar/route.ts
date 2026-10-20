import { calendarQuery, type CalendarWeekResponse } from "@/contracts/mobile/calendar";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadOwnerCalendarWeek } from "@/lib/calendar/week";
import { toCalendarWeek } from "@/lib/mobile/calendar-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** One week of the owner's calendar across all their businesses. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, calendarQuery);
  if (!query.ok) return query.response;
  try {
    const { owner } = guard.value;
    const week = await loadOwnerCalendarWeek(owner.id, owner.defaultTimezone, query.data.date);
    return mobileJson<CalendarWeekResponse>(toCalendarWeek(week));
  } catch (error) {
    return mobileServerError("Mobile calendar failed", error);
  }
}
