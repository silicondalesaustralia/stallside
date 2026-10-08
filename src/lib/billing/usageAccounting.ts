// KIT SHIM - same exports/shapes as StitchedUp's usage accounting, delegating
// every charge to lib/socialHost/hostCredits (kind 'render').
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  HostCreditsExhaustedError,
  hostConsumeCredits,
  hostCreditBalance,
  hostRefundCredits,
} from '@/lib/socialHost/hostCredits'
import {
  InsufficientUsageError,
  type ConsumeUsageResult,
  type RefundUsageResult,
  type UsageSnapshot,
} from '@/lib/socialHost/usageTypes'

export {
  INSUFFICIENT_USAGE_CODE,
  InsufficientUsageError,
  insufficientUsageBody,
  type ConsumeUsageResult,
  type RefundUsageResult,
  type UsageSnapshot,
} from '@/lib/socialHost/usageTypes'

const NO_CREDITS_CODE = 'no_render_credits' as const

export async function loadUsageSnapshot(_supabase: SupabaseClient, businessId: string): Promise<UsageSnapshot> {
  const balance = await hostCreditBalance(businessId, 'render')
  const remaining = balance ?? 9999
  return {
    accounting: 'wallet',
    includedAllowance: remaining,
    includedUsed: 0,
    includedRemaining: remaining,
    walletBalanceCents: 0,
    renderPriceCents: 0,
    periodKey: new Date().toISOString().slice(0, 7),
    canRender: remaining > 0,
    equivalentRenders: remaining,
  }
}

export async function evaluateUsageAccess(
  _supabase: SupabaseClient,
  businessId: string,
): Promise<
  | { allowed: true; accounting: 'wallet'; snapshot: UsageSnapshot }
  | { allowed: false; accounting: 'wallet'; snapshot: UsageSnapshot }
  | { allowed: true; accounting: 'legacy'; useFreeTrial: boolean }
  | { allowed: false; accounting: 'legacy'; reason: 'no_credits' }
> {
  const balance = await hostCreditBalance(businessId, 'render')
  if (balance !== null && balance < 1) return { allowed: false, accounting: 'legacy', reason: 'no_credits' }
  return { allowed: true, accounting: 'legacy', useFreeTrial: false }
}

export async function consumeRenderUsage(
  _supabase: SupabaseClient,
  data: {
    businessId: string
    generationId: string
    sourceType?: string
    sourceId?: string | null
    useFreeTrial?: boolean
    legacyNullRenderId?: boolean
  },
): Promise<ConsumeUsageResult> {
  try {
    await hostConsumeCredits({
      socialBusinessId: data.businessId,
      kind: 'render',
      actionId: data.generationId,
      count: 1,
      feature: data.sourceType,
    })
  } catch (err) {
    if (err instanceof HostCreditsExhaustedError) {
      throw new InsufficientUsageError({ includedRemaining: 0, walletBalanceCents: 0, renderPriceCents: 0 }, err.message)
    }
    throw err
  }
  return {
    charged: true,
    alreadyCharged: false,
    chargeSource: 'paid',
    ledgerEventId: null,
    renderPriceCents: 0,
    includedRemaining: 0,
    walletBalanceCents: 0,
    accounting: 'legacy',
  }
}

export async function refundRenderUsage(
  _supabase: SupabaseClient,
  data: { businessId: string; generationId: string; consumedMode?: 'paid' | 'free_trial' },
): Promise<RefundUsageResult> {
  await hostRefundCredits({ socialBusinessId: data.businessId, kind: 'render', actionId: data.generationId })
  return { refunded: true, alreadyRefunded: false, accounting: 'legacy' }
}

export async function recordUsageGenerationMetrics(
  _supabase: SupabaseClient,
  _data: { ledgerEventId: string | null; model?: string | null; cogsUsdEstimated?: number | null; latencyMs?: number | null },
): Promise<void> {}

export function paymentRequiredPayload(
  access: Awaited<ReturnType<typeof evaluateUsageAccess>>,
): { body: Record<string, unknown>; status: 402 } {
  if (access.allowed) throw new Error('paymentRequiredPayload called for allowed access')
  return {
    status: 402,
    body: { error: "You've run out of social credits. Top up to keep creating.", code: NO_CREDITS_CODE },
  }
}
