/** Demo data for the code-built product previews on the home page. */

export type MakersLpDemoEventKind = "pickup" | "production" | "social";

export type MakersLpDemoEvent = { day: number; label: string; kind: MakersLpDemoEventKind };

/** November 2026 events, keyed by day of the month. */
export const HOME_DEMO_CALENDAR_EVENTS: MakersLpDemoEvent[] = [
  { day: 3, label: "Instagram post", kind: "social" },
  { day: 5, label: "Soap batch", kind: "production" },
  { day: 6, label: "Pick-up 9–12", kind: "pickup" },
  { day: 10, label: "Facebook post", kind: "social" },
  { day: 12, label: "Candle batch", kind: "production" },
  { day: 13, label: "Pick-up 9–12", kind: "pickup" },
  { day: 18, label: "Delivery run", kind: "pickup" },
  { day: 20, label: "Pick-up 9–12", kind: "pickup" },
  { day: 24, label: "TikTok video", kind: "social" },
  { day: 26, label: "Gift boxes", kind: "production" },
  { day: 27, label: "Pick-up 9–12", kind: "pickup" },
];
