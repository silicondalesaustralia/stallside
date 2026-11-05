import { FREE_EMAILS_1 } from "./free-copy-1";
import { FREE_EMAILS_2 } from "./free-copy-2";
import { FREE_EMAILS_3 } from "./free-copy-3";
import { FREE_EMAILS_4 } from "./free-copy-4";
import { PRO_EMAILS_1 } from "./pro-copy-1";
import { PRO_EMAILS_2 } from "./pro-copy-2";
import { PRO_EMAILS_3 } from "./pro-copy-3";
import { RECOVERY_EMAILS } from "./recovery-copy";
import type { JourneyEmail, JourneyId } from "./types";

export const FREE_JOURNEY: JourneyEmail[] = [...FREE_EMAILS_1, ...FREE_EMAILS_2, ...FREE_EMAILS_3, ...FREE_EMAILS_4];
export const RECOVERY_JOURNEY: JourneyEmail[] = RECOVERY_EMAILS;
export const PRO_JOURNEY: JourneyEmail[] = [...PRO_EMAILS_1, ...PRO_EMAILS_2, ...PRO_EMAILS_3];

export const JOURNEYS: Record<JourneyId, JourneyEmail[]> = {
  free: FREE_JOURNEY,
  recovery: RECOVERY_JOURNEY,
  pro: PRO_JOURNEY,
};

/** Day-0 welcomes go out at signup / first Pro activation, not from the cron. */
export const FREE_WELCOME_KEY = "free_d00";
export const PRO_WELCOME_KEY = "pro_d00";

export function journeyEmail(key: string): JourneyEmail | null {
  return [...FREE_JOURNEY, ...RECOVERY_JOURNEY, ...PRO_JOURNEY].find((e) => e.key === key) ?? null;
}
