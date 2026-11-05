import { LAST_STAGE_GRACE_DAYS } from "./config";

const DAY_MS = 24 * 60 * 60 * 1000;

export function wholeDaysSince(start: Date, now: Date): number {
  return Math.floor((now.getTime() - start.getTime()) / DAY_MS);
}

/**
 * The single stage due now: the latest stage whose day has arrived, still inside its window
 * (until the next stage's day). Earlier unsent stages are never returned, so there's no backlog.
 */
export function dueStage<T extends { key: string; day: number }>(
  stages: readonly T[],
  ageDays: number,
  handled: ReadonlySet<string>,
): T | null {
  const sorted = [...stages].sort((a, b) => a.day - b.day);
  let index = -1;
  for (let i = 0; i < sorted.length; i += 1) {
    if (sorted[i].day <= ageDays) index = i;
  }
  if (index < 0) return null;
  const stage = sorted[index];
  const next = sorted[index + 1];
  const windowEnd = next ? next.day : stage.day + LAST_STAGE_GRACE_DAYS + 1;
  if (ageDays >= windowEnd) return null;
  return handled.has(stage.key) ? null : stage;
}
