import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { calendarWeekResponse } from "@contracts/mobile/calendar";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

/** One week of the calendar; `date` is any day in it, null for this week. */
export function useCalendarWeek(date: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["calendar", date],
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiFetch(date ? `/calendar?date=${date}` : "/calendar", {
        token,
        schema: calendarWeekResponse,
      }),
  });
}
