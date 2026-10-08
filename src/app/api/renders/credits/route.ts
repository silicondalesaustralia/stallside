import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { hostCreditBalance } from '@/lib/socialHost/hostCredits'

/** Unlimited balances are reported as this many renders so the UI never gates. */
const UNLIMITED_DISPLAY = 9999

export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  try {
    const balance = await hostCreditBalance(ctx.businessId, 'render')
    const creditsRemaining = balance ?? UNLIMITED_DISPLAY
    return NextResponse.json({
      accounting: 'legacy' as const,
      creditsRemaining,
      totalAvailableRenders: creditsRemaining,
      unlimited: balance === null,
      freeTrialUsed: true,
      freeTrialAvailable: false,
      canRender: creditsRemaining > 0,
      updatedAt: null,
      recentEvents: [],
      packs: [],
    })
  } catch (err) {
    console.error('[renders/credits] balance lookup failed:', err)
    return NextResponse.json({ error: 'Could not load credits' }, { status: 500 })
  }
}
