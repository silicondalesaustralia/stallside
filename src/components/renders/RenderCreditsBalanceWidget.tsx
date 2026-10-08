'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { RenderCreditsSummary } from '@/lib/renders/renderCreditsTypes'
import { InfoGuide } from '@/components/ui/InfoGuide'

const LOW_BALANCE_THRESHOLD = 3

export function RenderCreditsBalanceWidget({
  credits,
  loading,
  className = '',
  pulseKey = 0,
}: {
  credits: RenderCreditsSummary | null
  loading: boolean
  className?: string
  /** Increment after generate / top-up refresh to trigger a brief glow. */
  pulseKey?: number
}) {
  const lowBalance =
    credits != null &&
    credits.creditsRemaining > 0 &&
    credits.creditsRemaining < LOW_BALANCE_THRESHOLD

  const showFreeTrialOnly =
    credits != null &&
    credits.creditsRemaining === 0 &&
    credits.freeTrialAvailable

  const critical = credits != null && !credits.canRender

  let balanceText: ReactNode
  if (loading) {
    balanceText = (
      <span className="flex items-center gap-1.5 text-xs text-[#888]">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Loading credits…
      </span>
    )
  } else if (!credits) {
    balanceText = (
      <span className="text-xs text-[#888]">Could not load credit balance</span>
    )
  } else if (credits.accounting === 'wallet') {
    const included = credits.includedRemaining ?? 0
    const allowance = credits.includedAllowance ?? 0
    const cents = credits.walletBalanceCents ?? 0
    const dollars = (cents / 100).toFixed(2)
    balanceText = (
      <span className={`text-xs ${critical ? 'font-semibold text-red-600' : 'text-[#555]'}`}>
        <span className="font-bold tabular-nums">{included}</span>
        {' / '}
        {allowance} included
        {' · '}
        ${dollars} credit
      </span>
    )
  } else if (showFreeTrialOnly) {
    balanceText = (
      <span className="text-xs font-semibold text-emerald-700">
        1 free trial render available
      </span>
    )
  } else if (credits.creditsRemaining > 0) {
    balanceText = (
      <span
        className={`text-xs ${
          lowBalance ? 'font-semibold text-amber-700' : 'text-[#555]'
        }`}
      >
        <span className="font-bold tabular-nums">{credits.creditsRemaining}</span>
        {' '}
        render credit{credits.creditsRemaining !== 1 ? 's' : ''} remaining
      </span>
    )
  } else {
    balanceText = (
      <span className="text-xs font-semibold text-red-600">
        No render credits remaining
      </span>
    )
  }

  return (
    <div
      key={pulseKey > 0 ? `pulse-${pulseKey}` : 'static'}
      className={`flex items-center justify-between gap-3 border-b border-[#F0EDE5] px-4 py-2.5 transition-colors duration-500 ${
        lowBalance || critical ? 'bg-amber-50/80' : 'bg-[#FAFAF7]'
      } ${pulseKey > 0 ? 'animate-credit-pulse' : ''} ${className}`}
      data-testid="render-credits-balance-widget"
    >
      <div className="flex min-w-0 flex-1 items-center gap-0.5">
        {balanceText}
        <InfoGuide topic="renderBalance" />
      </div>
      <Link
        href="/dashboard/settings/billing"
        className="shrink-0 text-xs font-bold text-[#B8860B] hover:text-amber-800 underline underline-offset-2 transition-colors"
      >
        Top up
      </Link>
    </div>
  )
}
