/**
 * HOST INTEGRATION POINT #4 - usage billing (business model TBD).
 *
 * Every paid AI action in the social code funnels through these three hooks:
 *   kind 'render' - an AI image/design render (gpt-image, hybrid, recreate, slides background)
 *   kind 'ai'     - an AI text action (caption, week-plan copy, analysis)
 *
 * Default: unlimited and free (logs only). To charge, implement against
 * Vendl's own credits/wallet. Throwing from hostConsumeCredits blocks the
 * action with a 402 "payment required" response.
 */
export type CreditKind = 'render' | 'ai'

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
  void socialBusinessId
  void kind
  // TODO(vendl): externalAccountIdFor(socialBusinessId) gives Vendl's account id; return its balance.
  return null
}

export async function hostHasCredits(socialBusinessId: string, kind: CreditKind, count = 1): Promise<boolean> {
  const balance = await hostCreditBalance(socialBusinessId, kind)
  return balance === null || balance >= count
}

/** Charge after a successful generation. Throw HostCreditsExhaustedError to refuse. */
export async function hostConsumeCredits(ctx: CreditContext): Promise<void> {
  // TODO(vendl): debit Vendl's ledger idempotently on ctx.actionId.
  console.info('[socialHost][credits] consume', ctx)
}

/** Undo a charge when generation failed after charging. Must be idempotent. */
export async function hostRefundCredits(ctx: Pick<CreditContext, 'socialBusinessId' | 'kind' | 'actionId'>): Promise<void> {
  // TODO(vendl): reverse the debit for ctx.actionId if one exists.
  console.info('[socialHost][credits] refund', ctx)
}
