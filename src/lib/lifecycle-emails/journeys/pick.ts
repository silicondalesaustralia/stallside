import { FREE_JOURNEY, PRO_JOURNEY, RECOVERY_JOURNEY } from "./catalog";
import { dueStage, wholeDaysSince } from "./schedule";
import type { JourneyEmail, JourneyId } from "./types";

const FREE_STAGES = FREE_JOURNEY.filter((e) => e.day > 0);
const PRO_STAGES = PRO_JOURNEY.filter((e) => e.day > 0);

export type JourneyState = {
  isPro: boolean;
  /** Pro Day 0 (proOnboardingStartedAt, else the legacy Pro welcome date). */
  proAnchor: Date | null;
  hasProducts: boolean;
  createdAt: Date;
  handled: ReadonlySet<string>;
};

export type JourneyPick =
  | { kind: "start_pro" }
  | { kind: "send"; journey: JourneyId; email: JourneyEmail }
  | null;

/** What the daily run should do for one owner: at most one email. */
export function pickJourneyStep(state: JourneyState, now: Date): JourneyPick {
  if (state.isPro) {
    if (!state.proAnchor) return { kind: "start_pro" };
    const email = dueStage(PRO_STAGES, wholeDaysSince(state.proAnchor, now), state.handled);
    return email ? { kind: "send", journey: "pro", email } : null;
  }
  const age = wholeDaysSince(state.createdAt, now);
  const journey: JourneyId = state.hasProducts ? "free" : "recovery";
  const email = dueStage(state.hasProducts ? FREE_STAGES : RECOVERY_JOURNEY, age, state.handled);
  return email ? { kind: "send", journey, email } : null;
}
