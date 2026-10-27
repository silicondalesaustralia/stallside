import { router } from "expo-router";
import type {
  CALENDAR_CATEGORIES,
  MobileCalendarEvent,
} from "@contracts/mobile/calendar";
import { openLink } from "@/lib/open-link";
import { openOnWeb } from "@/lib/open-web";

export type CalendarCategory = (typeof CALENDAR_CATEGORIES)[number];
export type CalendarFilter = CalendarCategory | "all";

export const CATEGORY_LABEL: Record<CalendarCategory, string> = {
  orders: "Order cut-offs",
  fulfilment: "Pickup & delivery",
  markets: "Markets",
  custom: "Custom orders",
  production: "Production",
  subscriptions: "Subscriptions",
  external: "My calendar",
};

export const CATEGORY_COLOR: Record<CalendarCategory, string> = {
  orders: "#f59e0b",
  fulfilment: "#10b981",
  markets: "#f97316",
  custom: "#ec4899",
  production: "#78716c",
  subscriptions: "#14b8a6",
  external: "#94a3b8",
};

/** Dashboard pages the app already has natively. */
const NATIVE_PATHS: [prefix: string, route: "/orders" | "/subscriptions"][] = [
  ["/dashboard/collections", "/orders"],
  ["/dashboard/subscriptions", "/subscriptions"],
];

export function openCalendarEvent(
  event: MobileCalendarEvent,
  token: string | null,
): void {
  if (!event.href) return;
  if (/^https?:\/\//.test(event.href)) {
    void openLink(event.href);
    return;
  }
  const native = NATIVE_PATHS.find(([prefix]) => event.href.startsWith(prefix));
  if (native) {
    router.push(native[1]);
    return;
  }
  void openOnWeb(event.href, token);
}
