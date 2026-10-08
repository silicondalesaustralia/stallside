// KIT SHIM - render credits charge through lib/socialHost/hostCredits (kind 'render').
import type { SupabaseClient } from '@supabase/supabase-js'
import { hostConsumeCredits } from '@/lib/socialHost/hostCredits'

export type RenderCreditBalance = {
  creditsRemaining: number
  freeTrialUsed: boolean
}

export type RenderEligibility =
  | { allowed: true; useFreeTrial: boolean }
  | { allowed: false; reason: 'no_credits' }

/** Callers read the social DB `render_credits` row; no row (the kit default) means allowed -
 *  the real gate is hostConsumeCredits throwing HostCreditsExhaustedError. */
export function evaluateRenderEligibility(balance: RenderCreditBalance | null): RenderEligibility {
  if (!balance) return { allowed: true, useFreeTrial: false }
  return balance.creditsRemaining > 0 ? { allowed: true, useFreeTrial: false } : { allowed: false, reason: 'no_credits' }
}

export async function consumeRenderCredits(
  _supabase: SupabaseClient,
  data: { businessId: string; renderId: string | null; useFreeTrial: boolean; count: number },
): Promise<void> {
  const count = Math.max(0, Math.floor(data.count))
  if (count === 0) return
  await hostConsumeCredits({
    socialBusinessId: data.businessId,
    kind: 'render',
    actionId: data.renderId ?? `render-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    count,
  })
}
