/** Presentation types for the operations calendar (not persisted). */

export type CalendarEventType =
  | "menu_open"
  | "menu_close"
  | "production"
  | "packing"
  | "pickup"
  | "delivery"
  | "subscription"
  | "custom_order"
  | "market";

export type CalendarView = "week" | "month" | "agenda";

/** Which domain handler applies when the user drags/resizes on the calendar. */
export type CalendarRescheduleAction =
  | "menu_close"
  | "market"
  | "custom_order"
  | "pickup_window"
  | "delivery_zone";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  status: string | null;
  sourceType: string;
  sourceId: string;
  href: string;
  editHref: string | null;
  location: string | null;
  summary: string | null;
  dayKey: string;
  sortKey: string;
  metadata: Record<string, string | number | boolean | null>;
  /** User can drag to reschedule (updates source object). */
  editable: boolean;
  /** User can resize start/end when the event has a real time window. */
  durationEditable: boolean;
  rescheduleAction: CalendarRescheduleAction | null;
};

export const CALENDAR_TYPE_LABEL: Record<CalendarEventType, string> = {
  menu_open: "Orders open",
  menu_close: "Orders close",
  production: "Production",
  packing: "Pack orders",
  pickup: "Pickup",
  delivery: "Delivery",
  subscription: "Subscription",
  custom_order: "Custom order",
  market: "Market / event",
};

export const CALENDAR_FILTER_TYPES: CalendarEventType[] = [
  "menu_open",
  "menu_close",
  "production",
  "packing",
  "pickup",
  "delivery",
  "subscription",
  "custom_order",
  "market",
];
