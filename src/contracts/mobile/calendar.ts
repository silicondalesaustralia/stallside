import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Any day in the wanted week; defaults to this week. */
export const calendarQuery = z.object({ date: dateKey.optional() });

export const CALENDAR_CATEGORIES = [
  "orders",
  "fulfilment",
  "markets",
  "custom",
  "production",
  "subscriptions",
  "external",
] as const;

export const mobileCalendarEvent = z.object({
  id: z.string(),
  category: z.enum(CALENDAR_CATEGORIES),
  typeLabel: z.string(),
  title: z.string(),
  /** Already formatted in the business's timezone, e.g. "9:00 am – 11:00 am". */
  timeLabel: z.string(),
  status: z.string().nullable(),
  location: z.string().nullable(),
  summary: z.string().nullable(),
  /** Dashboard path, or a full URL for Google / Outlook events. */
  href: z.string(),
});
export type MobileCalendarEvent = z.infer<typeof mobileCalendarEvent>;

export const calendarWeekResponse = z.object({
  heading: z.string(),
  timeZone: z.string(),
  weekStart: dateKey,
  previousWeek: dateKey,
  nextWeek: dateKey,
  today: dateKey,
  days: z.array(
    z.object({
      dayKey: dateKey,
      label: z.string(),
      events: z.array(mobileCalendarEvent),
    }),
  ),
});
export type CalendarWeekResponse = z.infer<typeof calendarWeekResponse>;
