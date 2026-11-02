/**
 * HOST INTEGRATION POINT #4 - usage billing (lib/socialCredits).
 *
 * Every paid AI action in the social code funnels through these three hooks:
 *   kind 'render' - an AI image/design render (gpt-image, hybrid, recreate, slides background) -> design credits
 *   kind 'clip'   - a video clip -> clip credits
 *   kind 'ai'     - an AI text action (caption, week-plan copy, analysis) -> unmetered
 *
 * Throwing from hostConsumeCredits blocks the action with a 402 "payment required" response.
 */
import { socialDb } from '@/lib/socialHost/socialDb'
import { creditOwnerForSocialBusiness } from '@/lib/socialCredits/creditOwner'
import {
  SocialCreditsExhaustedError,
  consumeSocialCredits,
  loadSocialCreditSummary,
  refundSocialCredits,
} from '@/lib/socialCredits/ledger'
import type { SocialCreditKind } from '@/lib/socialCredits/packs'

export type CreditKind = 'render' | 'clip' | 'ai'

function ledgerKind(kind: CreditKind): SocialCreditKind | null {
  if (kind === 'render') return 'design'
  if (kind === 'clip') return 'clip'
  return null
}

export type CreditContext = {
  /** Social DB business id (uuid). */
  socialBusinessId: string
  kind: CreditKind
  /** Idempotency key - the same actionId must never be charged twice. */
  actionId: string
  count: number
  /** e.g. 'social_caption', 'hybrid_render', 'week_plan'. */
  feature?: string
}

export class HostCreditsExhaustedError extends Error {
  constructor(message = 'You have no social credits left. Top up to keep creating.') {
    super(message)
    this.name = 'HostCreditsExhaustedError'
  }
}

/**
 * Credits left for the account, or null for unlimited. Drives the credits
 * badge in the UI (GET /api/renders/credits) and the pre-flight checks.
 */
export async function hostCreditBalance(socialBusinessId: string, kind: CreditKind): Promise<number | null> {
  const ledger = ledgerKind(kind)
  if (!ledger) return null
  const owner = await creditOwnerForSocialBusiness(socialBusinessId)
  if (!owner) return 0
  const summary = await loadSocialCreditSummary(socialDb(), owner.ownerId, owner.isPro)
  return summary[ledger].available
}

export async function hostHasCredits(socialBusinessId: string, kind: CreditKind, count = 1): Promise<boolean> {
  const balance = await hostCreditBalance(socialBusinessId, kind)
  return balance === null || balance >= count
}

/** Charge after a successful generation. Throw HostCreditsExhaustedError to refuse. */
export async function hostConsumeCredits(ctx: CreditContext): Promise<void> {
  const ledger = ledgerKind(ctx.kind)
  if (!ledger) return
  const owner = await creditOwnerForSocialBusiness(ctx.socialBusinessId)
  if (!owner) throw new HostCreditsExhaustedError()
  try {
    await consumeSocialCredits(socialDb(), {
      ownerId: owner.ownerId,
      businessId: ctx.socialBusinessId,
      isPro: owner.isPro,
      kind: ledger,
      actionId: ctx.actionId,
      count: ctx.count,
    })
  } catch (err) {
    if (err instanceof SocialCreditsExhaustedError) throw new HostCreditsExhaustedError(err.message)
    throw err
  }
}

/** Undo a charge when generation failed after charging. Idempotent. */
export async function hostRefundCredits(ctx: Pick<CreditContext, 'socialBusinessId' | 'kind' | 'actionId'>): Promise<void> {
  const ledger = ledgerKind(ctx.kind)
  if (!ledger) return
  await refundSocialCredits(socialDb(), ledger, ctx.actionId)
}
