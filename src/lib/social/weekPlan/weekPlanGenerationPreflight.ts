import type { SupabaseClient } from '@supabase/supabase-js'
import {
  evaluateUsageAccess,
  loadUsageSnapshot,
} from '@/lib/billing/usageAccounting'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { AI_DESIGNED_SET_CREDIT_COST } from '@/lib/social/designedCredits'

export type WeekPlanCreditPreflight = {
  ok: true
  itemCount: number
  creditsRequired: number
  previewCount: number
  useFreeTrial: boolean
  accounting: 'legacy' | 'wallet'
  creditsRemaining?: number
  equivalentRenders?: number
} | {
  ok: false
  itemCount: number
  creditsRequired: number
  previewCount: number
  code: 'no_render_credits' | 'insufficient_usage_balance'
  creditsRemaining?: number
  equivalentRenders?: number
  includedRemaining?: number
  walletBalanceCents?: number
  renderPriceCents?: number
}

export async function preflightWeekPlanGenerationCredits(
  db: SupabaseClient,
  businessId: string,
  itemCount: number,
): Promise<WeekPlanCreditPreflight> {
  const count = Math.max(0, Math.floor(itemCount))
  const creditsRequired = count * AI_DESIGNED_SET_CREDIT_COST
  const previewCount = count * 3

  if (count === 0) {
    return {
      ok: false,
      itemCount: 0,
      creditsRequired: 0,
      previewCount: 0,
      code: 'no_render_credits',
    }
  }

  if (!isUsageWalletEnabled()) {
    const { data: balanceRow } = await db
      .from('render_credits')
      .select('credits_remaining, free_trial_used')
      .eq('business_id', businessId)
      .maybeSingle()

    const creditsRemaining = balanceRow?.credits_remaining ?? 0
    const freeTrialUsed = balanceRow?.free_trial_used ?? false
    const freeTrialAvailable = !freeTrialUsed && creditsRemaining === 0
    const available = creditsRemaining + (freeTrialAvailable ? 1 : 0)

    if (available < creditsRequired) {
      return {
        ok: false,
        itemCount: count,
        creditsRequired,
        previewCount,
        code: 'no_render_credits',
        creditsRemaining,
        equivalentRenders: available,
      }
    }

    if (freeTrialAvailable && count > 1) {
      return {
        ok: false,
        itemCount: count,
        creditsRequired,
        previewCount,
        code: 'no_render_credits',
        creditsRemaining: 0,
        equivalentRenders: 1,
      }
    }

    return {
      ok: true,
      itemCount: count,
      creditsRequired,
      previewCount,
      useFreeTrial: freeTrialAvailable && count === 1,
      accounting: 'legacy',
      creditsRemaining,
      equivalentRenders: available,
    }
  }

  const snapshot = await loadUsageSnapshot(db, businessId)
  if (snapshot.equivalentRenders < creditsRequired) {
    return {
      ok: false,
      itemCount: count,
      creditsRequired,
      previewCount,
      code: 'insufficient_usage_balance',
      equivalentRenders: snapshot.equivalentRenders,
      includedRemaining: snapshot.includedRemaining,
      walletBalanceCents: snapshot.walletBalanceCents,
      renderPriceCents: snapshot.renderPriceCents,
    }
  }

  const access = await evaluateUsageAccess(db, businessId)
  if (!access.allowed) {
    return {
      ok: false,
      itemCount: count,
      creditsRequired,
      previewCount,
      code: 'insufficient_usage_balance',
      equivalentRenders: snapshot.equivalentRenders,
      includedRemaining: snapshot.includedRemaining,
      walletBalanceCents: snapshot.walletBalanceCents,
      renderPriceCents: snapshot.renderPriceCents,
    }
  }

  return {
    ok: true,
    itemCount: count,
    creditsRequired,
    previewCount,
    useFreeTrial: false,
    accounting: 'wallet',
    equivalentRenders: snapshot.equivalentRenders,
  }
}
