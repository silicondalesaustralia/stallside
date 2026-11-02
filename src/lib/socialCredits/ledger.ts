import type { SupabaseClient } from '@supabase/supabase-js'
import {
  PRO_MONTHLY_ALLOWANCE,
  SOCIAL_CREDIT_KINDS,
  socialCreditPeriodKey,
  type SocialCreditKind,
  type SocialCreditPack,
} from './packs'

export type SocialCreditBalance = {
  /** Monthly Pro allowance (0 on Free). */
  allowance: number
  allowanceLeft: number
  purchased: number
  available: number
}

export type SocialCreditSummary = Record<SocialCreditKind, SocialCreditBalance>

export class SocialCreditsExhaustedError extends Error {
  constructor(readonly kind: SocialCreditKind, message: string) {
    super(message)
    this.name = 'SocialCreditsExhaustedError'
  }
}

type SummaryRow = { kind: SocialCreditKind; purchased: number; allowance_used: number }

export async function loadSocialCreditSummary(
  db: SupabaseClient,
  ownerId: string,
  isPro: boolean,
): Promise<SocialCreditSummary> {
  const { data, error } = await db.rpc('social_credit_summary', {
    p_owner_id: ownerId,
    p_period_key: socialCreditPeriodKey(),
  })
  if (error) throw new Error(`[socialCredits] summary failed: ${error.message}`)
  const rows = (data ?? []) as SummaryRow[]
  const summary = {} as SocialCreditSummary
  for (const kind of SOCIAL_CREDIT_KINDS) {
    const row = rows.find((r) => r.kind === kind)
    const allowance = isPro ? PRO_MONTHLY_ALLOWANCE[kind] : 0
    const allowanceLeft = Math.max(0, allowance - Number(row?.allowance_used ?? 0))
    const purchased = Math.max(0, Number(row?.purchased ?? 0))
    summary[kind] = { allowance, allowanceLeft, purchased, available: allowanceLeft + purchased }
  }
  return summary
}

/** Charges allowance first, then bought credits. Same actionId is only ever charged once. */
export async function consumeSocialCredits(
  db: SupabaseClient,
  input: { ownerId: string; businessId: string | null; isPro: boolean; kind: SocialCreditKind; actionId: string; count: number },
): Promise<void> {
  const { data, error } = await db.rpc('social_credit_consume', {
    p_owner_id: input.ownerId,
    p_business_id: input.businessId,
    p_kind: input.kind,
    p_action_id: input.actionId,
    p_count: input.count,
    p_allowance: input.isPro ? PRO_MONTHLY_ALLOWANCE[input.kind] : 0,
    p_period_key: socialCreditPeriodKey(),
  })
  if (error) throw new Error(`[socialCredits] consume failed: ${error.message}`)
  const result = data as { ok?: boolean } | null
  if (!result?.ok) {
    const noun = input.kind === 'clip' ? 'video clip' : 'design'
    throw new SocialCreditsExhaustedError(
      input.kind,
      `You don't have enough ${noun} credits. Buy a pack to keep creating.`,
    )
  }
}

/** Gives back up to `count` (default all) of an action's charge. Safe to call more than once. */
export async function refundSocialCredits(
  db: SupabaseClient,
  kind: SocialCreditKind,
  actionId: string,
  count?: number,
): Promise<number> {
  const { data, error } = await db.rpc('social_credit_refund', {
    p_kind: kind,
    p_action_id: actionId,
    p_count: count ?? null,
  })
  if (error) throw new Error(`[socialCredits] refund failed: ${error.message}`)
  return typeof data === 'number' ? data : 0
}

/** Adds a paid pack. Idempotent on the Stripe PaymentIntent id. */
export async function grantSocialCreditPack(
  db: SupabaseClient,
  input: { ownerId: string; pack: SocialCreditPack; paymentIntentId: string; amountCents: number; currency: string },
): Promise<void> {
  const { error } = await db.from('social_credit_ledger').upsert(
    {
      owner_id: input.ownerId,
      kind: input.pack.kind,
      source: 'purchased',
      reason: 'purchase',
      delta: input.pack.credits,
      action_id: input.paymentIntentId,
      pack_id: input.pack.id,
      amount_cents: input.amountCents,
      currency: input.currency,
    },
    { onConflict: 'owner_id,kind,reason,source,action_id', ignoreDuplicates: true },
  )
  if (error) throw new Error(`[socialCredits] grant failed: ${error.message}`)
}
