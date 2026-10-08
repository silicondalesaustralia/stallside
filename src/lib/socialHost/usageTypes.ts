// Result shapes the social routes expect from lib/billing/usageAccounting (kit shim).
export const INSUFFICIENT_USAGE_CODE = 'insufficient_usage_balance' as const

export type UsageSnapshot = {
  accounting: 'wallet'
  includedAllowance: number
  includedUsed: number
  includedRemaining: number
  walletBalanceCents: number
  renderPriceCents: number
  periodKey: string
  canRender: boolean
  equivalentRenders: number
}

export type ConsumeUsageResult = {
  charged: boolean
  alreadyCharged: boolean
  chargeSource: 'included' | 'wallet' | 'free_trial' | 'paid'
  ledgerEventId: string | null
  renderPriceCents: number
  includedRemaining: number
  walletBalanceCents: number
  accounting: 'wallet' | 'legacy'
}

export type RefundUsageResult = {
  refunded: boolean
  alreadyRefunded: boolean
  reason?: string
  accounting: 'wallet' | 'legacy'
}

export class InsufficientUsageError extends Error {
  readonly code = INSUFFICIENT_USAGE_CODE
  readonly includedRemaining: number
  readonly walletBalanceCents: number
  readonly renderPriceCents: number

  constructor(
    params: { includedRemaining: number; walletBalanceCents: number; renderPriceCents: number },
    message?: string,
  ) {
    super(message ?? "You've run out of social credits for another render.")
    this.name = 'InsufficientUsageError'
    this.includedRemaining = params.includedRemaining
    this.walletBalanceCents = params.walletBalanceCents
    this.renderPriceCents = params.renderPriceCents
  }
}

export function insufficientUsageBody(err: InsufficientUsageError) {
  return {
    error: err.message,
    code: err.code,
    includedRemaining: err.includedRemaining,
    walletBalanceCents: err.walletBalanceCents,
    renderPriceCents: err.renderPriceCents,
  }
}
