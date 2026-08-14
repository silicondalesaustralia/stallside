import { SITE_URL } from "@/lib/legal";

export type ShopperInterval = "WEEKLY" | "FORTNIGHTLY" | "MONTHLY";

export function subscriptionOffersPath(standSlug: string) {
  return `/s/${standSlug}/sub`;
}

export function subscriptionOfferPath(standSlug: string, offerSlug: string) {
  return `/s/${standSlug}/sub/${offerSlug}`;
}

export function subscriptionOfferUrl(standSlug: string, offerSlug: string) {
  return `${SITE_URL}${subscriptionOfferPath(standSlug, offerSlug)}`;
}

export function subscriptionManagePath(standSlug: string, token: string) {
  return `/s/${standSlug}/sub/manage/${token}`;
}

export function subscriptionManageUrl(standSlug: string, token: string) {
  return `${SITE_URL}${subscriptionManagePath(standSlug, token)}`;
}

export function intervalLabel(interval: ShopperInterval | string): string {
  switch (interval) {
    case "WEEKLY":
      return "Weekly";
    case "FORTNIGHTLY":
      return "Fortnightly";
    case "MONTHLY":
      return "Monthly";
    default:
      return "Recurring";
  }
}

/** Stripe recurring config for Connect Prices / Checkout. */
export function stripeRecurringFromInterval(interval: ShopperInterval | string): {
  interval: "week" | "month";
  interval_count: number;
} {
  switch (interval) {
    case "FORTNIGHTLY":
      return { interval: "week", interval_count: 2 };
    case "MONTHLY":
      return { interval: "month", interval_count: 1 };
    case "WEEKLY":
    default:
      return { interval: "week", interval_count: 1 };
  }
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function weekdayLabel(day: number | null | undefined): string | null {
  if (day == null || day < 0 || day > 6) return null;
  return WEEKDAY_NAMES[day];
}

/**
 * Next collection datetime at local noon on the given weekday.
 * If weekday is null, uses `from` (billing period end) as the anchor day.
 */
export function nextCollectionAt(params: {
  from: Date;
  weekday: number | null | undefined;
  interval: ShopperInterval | string;
}): Date {
  const base = new Date(params.from);
  if (params.weekday != null && params.weekday >= 0 && params.weekday <= 6) {
    const result = new Date(base);
    const delta = (params.weekday - result.getDay() + 7) % 7;
    result.setDate(result.getDate() + (delta === 0 ? 0 : delta));
    result.setHours(12, 0, 0, 0);
    if (result.getTime() < base.getTime()) {
      const step =
        params.interval === "MONTHLY"
          ? 28
          : params.interval === "FORTNIGHTLY"
            ? 14
            : 7;
      result.setDate(result.getDate() + step);
    }
    return result;
  }
  const result = new Date(base);
  result.setHours(12, 0, 0, 0);
  return result;
}

export function parseShopperSubInterval(
  raw: unknown,
): ShopperInterval | null {
  const v = String(raw ?? "").trim().toUpperCase();
  if (v === "WEEKLY" || v === "FORTNIGHTLY" || v === "MONTHLY") return v;
  return null;
}
