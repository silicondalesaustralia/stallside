export type BillingCadence = "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "ONCE";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Retry a failed renewal after 1, 3 and 5 more days, then cancel. */
export const RETRY_DELAYS_DAYS = [1, 3, 5] as const;

/** Box subscriptions bill on the offer interval; memberships on the chosen plan. */
export function billingCadence(input: {
  isMembership: boolean;
  interval: string;
  billingPlan: string | null;
}): BillingCadence {
  if (input.isMembership) {
    if (input.billingPlan === "UPFRONT") return "ONCE";
    return input.billingPlan === "MONTHLY" ? "MONTHLY" : "WEEKLY";
  }
  if (input.interval === "MONTHLY") return "MONTHLY";
  if (input.interval === "FORTNIGHTLY") return "FORTNIGHTLY";
  return "WEEKLY";
}

function addMonthsClamped(from: Date, months: number): Date {
  const result = new Date(from);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function addBillingPeriod(from: Date, cadence: BillingCadence): Date | null {
  switch (cadence) {
    case "WEEKLY":
      return new Date(from.getTime() + 7 * DAY_MS);
    case "FORTNIGHTLY":
      return new Date(from.getTime() + 14 * DAY_MS);
    case "MONTHLY":
      return addMonthsClamped(from, 1);
    default:
      return null;
  }
}

/** Start of the period after `periodStart`, or null when billing is finished. */
export function nextBillingAfter(
  periodStart: Date,
  cadence: BillingCadence,
  termEndsAt: Date | null,
): Date | null {
  const next = addBillingPeriod(periodStart, cadence);
  if (!next) return null;
  if (termEndsAt && next.getTime() >= termEndsAt.getTime()) return null;
  return next;
}

export type FailureOutcome =
  | { action: "retry"; retryAt: Date }
  | { action: "cancel" };

/** `failures` counts every failed attempt for the period, including this one. */
export function afterFailedCharge(failures: number, now: Date): FailureOutcome {
  const delay = RETRY_DELAYS_DAYS[failures - 1];
  if (delay === undefined) return { action: "cancel" };
  return { action: "retry", retryAt: new Date(now.getTime() + delay * DAY_MS) };
}

/** When a paused subscription resumes, never bill for the paused time. */
export function resumedBillingAt(nextBillingAt: Date | null, now: Date): Date | null {
  if (!nextBillingAt) return null;
  return nextBillingAt.getTime() < now.getTime() ? now : nextBillingAt;
}
