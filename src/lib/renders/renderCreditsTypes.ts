/** Shape returned by GET /api/renders/credits (client-safe subset). */
export interface RenderCreditsSummary {
  accounting: 'legacy' | 'wallet'
  creditsRemaining: number
  freeTrialUsed: boolean
  freeTrialAvailable: boolean
  canRender: boolean
  includedAllowance?: number
  includedUsed?: number
  includedRemaining?: number
  walletBalanceCents?: number
  renderPriceCents?: number
  periodKey?: string
}

export async function fetchRenderCreditsSummary(): Promise<RenderCreditsSummary> {
  const res = await fetch('/api/renders/credits')
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load render credits')
  }
  return {
    accounting: data.accounting === 'wallet' ? 'wallet' : 'legacy',
    creditsRemaining: data.creditsRemaining ?? 0,
    freeTrialUsed: Boolean(data.freeTrialUsed),
    freeTrialAvailable: Boolean(data.freeTrialAvailable),
    canRender: Boolean(data.canRender),
    includedAllowance: data.includedAllowance,
    includedUsed: data.includedUsed,
    includedRemaining: data.includedRemaining,
    walletBalanceCents: data.walletBalanceCents,
    renderPriceCents: data.renderPriceCents,
    periodKey: data.periodKey,
  }
}
