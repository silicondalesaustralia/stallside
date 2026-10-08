// KIT SHIM - AI text actions charge through lib/socialHost/hostCredits (kind 'ai').
import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { hostConsumeCredits, hostRefundCredits } from '@/lib/socialHost/hostCredits'

export type ConsumeAiCreditResult = {
  charged: boolean
  alreadyCharged: boolean
  skipped: boolean
  skipReason?: 'test' | 'trial' | 'demo' | 'zero_credits' | 'not_ai_credit'
  chargeSource: 'included_allowance' | 'included_in_plan' | 'wallet' | 'included' | 'purchased' | null
  ledgerEventId: string | null
  aiCredits: number
  amountCents: number
  actionId: string
  exhausted?: boolean
}

export async function consumeAiCredits(
  _db: SupabaseClient,
  input: {
    businessId: string
    feature: string
    actionId?: string
    isTest?: boolean
    credits?: number
    sourceType?: string
    sourceId?: string | null
  },
): Promise<ConsumeAiCreditResult> {
  const actionId = input.actionId?.trim() || randomUUID()
  const credits = input.credits ?? 1
  const base = { alreadyCharged: false, ledgerEventId: null, aiCredits: credits, amountCents: 0, actionId }
  if (input.isTest) {
    return { ...base, charged: false, skipped: true, skipReason: 'test', chargeSource: null }
  }
  await hostConsumeCredits({
    socialBusinessId: input.businessId,
    kind: 'ai',
    actionId,
    count: credits,
    feature: input.feature,
  })
  return { ...base, charged: true, skipped: false, chargeSource: 'purchased' }
}

export async function refundAiCredits(
  _db: SupabaseClient,
  input: { businessId: string; actionId: string },
): Promise<{ refunded: boolean; alreadyRefunded: boolean }> {
  if (!input.actionId.trim()) return { refunded: false, alreadyRefunded: false }
  await hostRefundCredits({ socialBusinessId: input.businessId, kind: 'ai', actionId: input.actionId })
  return { refunded: true, alreadyRefunded: false }
}
