/**
 * Infographic AI-designed background - gated by env until compose UI ships.
 * Set INFOGRAPHIC_AI_BACKGROUND_ENABLED=true on Vercel (+ redeploy) to allow API requests.
 */

export function isInfographicAiBackgroundEnabled(): boolean {
  return process.env.INFOGRAPHIC_AI_BACKGROUND_ENABLED?.trim() === 'true'
}

/** Paid credits required to attempt inline AI background (2 on success: AI + composite). */
export const INFOGRAPHIC_AI_BACKGROUND_CREDITS = 2

/** Fallback resvg-only path when AI is skipped or fails. */
export const INFOGRAPHIC_RESVG_ONLY_CREDITS = 1

export function canAttemptInfographicAiBackground(creditsRemaining: number): boolean {
  return creditsRemaining >= INFOGRAPHIC_AI_BACKGROUND_CREDITS
}
