/**
 * Buddy planner insights - presentation types only.
 *
 * Production intelligence (recent jobs, reviews, unpromoted services) is NOT wired yet.
 * Do not invent insights in UI - pass `null` until a real API exists.
 */

export type BuddyPlannerInsight = {
  id: string
  headline: string
  bullets: string[]
}

export type BuddyPlannerInsightsResult = {
  insights: BuddyPlannerInsight[]
  /** False until backend surfaces real suggestions. */
  supported: boolean
}

/** Placeholder - always returns empty until insight pipeline ships. */
export function resolveBuddyPlannerInsights(): BuddyPlannerInsightsResult {
  return {
    insights: [],
    supported: false,
  }
}
