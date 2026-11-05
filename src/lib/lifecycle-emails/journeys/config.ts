/**
 * Lifecycle journeys v2 (Free 60-day, inactive recovery, Pro 45-day) replace the legacy welcome,
 * Pro welcome and Day 3 note when LIFECYCLE_JOURNEYS_V2=1. Off by default.
 */
export function journeysEnabled(): boolean {
  return process.env.LIFECYCLE_JOURNEYS_V2 === "1";
}

/** Done-For-You website emails and sentences stay hidden until LIFECYCLE_DFY_LIVE=1. */
export function doneForYouLive(): boolean {
  return process.env.LIFECYCLE_DFY_LIVE === "1";
}

/** Optional ISO date: only owners created on or after it join the journeys. */
export function journeysSince(): Date | null {
  const raw = process.env.LIFECYCLE_JOURNEYS_V2_SINCE?.trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** How long the last email of a journey stays sendable if a cron run is missed. */
export const LAST_STAGE_GRACE_DAYS = 7;
