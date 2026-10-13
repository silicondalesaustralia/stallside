import { CalendarAuthError, CalendarNotFoundError } from "../types";

const API = "https://www.googleapis.com/calendar/v3";

/** Calls the Calendar v3 API; maps 401/404/410 to typed errors the sync can act on. */
export async function googleCalendarFetch<T>(
  accessToken: string,
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> } = {},
): Promise<T | null> {
  const url = new URL(`${API}${path}`);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401) throw new CalendarAuthError("Google rejected the access token");
  if (res.status === 404 || res.status === 410) {
    throw new CalendarNotFoundError(`Google Calendar resource not found: ${path}`);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google Calendar ${init.method ?? "GET"} ${path} failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  return (await res.json()) as T;
}
