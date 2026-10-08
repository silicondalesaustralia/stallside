import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { insufficientUsageBody, InsufficientUsageError } from '@/lib/billing/usageAccounting'
import { loadPlanForBusiness } from '@/lib/social/weekPlan/weekPlanService'
import {
  startWeekPlanGeneration,
  WeekPlanGenerationStartError,
} from '@/lib/social/weekPlan/startWeekPlanGeneration'
import { preflightWeekPlanGenerationCredits } from '@/lib/social/weekPlan/weekPlanGenerationPreflight'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

/** POST - queue async generation for all plan items (returns immediately). */
export async function POST(req: NextRequest, context: RouteContext) {
  if (!isAiDesignedEnabled()) {
    return NextResponse.json({ error: 'AI Designed is not enabled' }, { status: 404 })
  }

  const { id: planId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  const { data: userData } = await db.from('users').select('business_id').eq('id', user.id).single()
  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    const result = await startWeekPlanGeneration(db, loaded.plan, loaded.items)
    logWeekBuilderAnalytics('week_generation_started', {
      planId,
      businessId,
      itemCount: result.queuedCount,
      creditsRequired: result.creditsRequired,
    })

    // Best-effort kick - fire-and-forget; never await image generation here.
    void triggerWeekPlanProcessor()

    return NextResponse.json({
      ok: true,
      planId,
      ...result,
      message: 'Generation started - you can leave this page.',
    })
  } catch (err) {
    if (err instanceof WeekPlanGenerationStartError) {
      if (err.status === 402) {
        return NextResponse.json(
          {
            error: err.message,
            code: err.code,
          },
          { status: 402 },
        )
      }
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    if (err instanceof InsufficientUsageError) {
      return NextResponse.json(insufficientUsageBody(err), { status: 402 })
    }
    console.error('[WeekPlan][generate]', err)
    return NextResponse.json({ error: 'Could not start generation' }, { status: 500 })
  }
}

/** GET - credit preflight for confirmation UI. */
export async function GET(req: NextRequest, context: RouteContext) {
  const { id: planId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  const { data: userData } = await db.from('users').select('business_id').eq('id', user.id).single()
  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const pendingItems = loaded.items.filter((i) => i.generation_status === 'not_started')
  const preflight = await preflightWeekPlanGenerationCredits(db, businessId, pendingItems.length)

  return NextResponse.json({
    planId,
    itemCount: pendingItems.length,
    previewCount: preflight.previewCount,
    creditsRequired: preflight.creditsRequired,
    canStart:
      loaded.plan.status === 'plan_approved' &&
      loaded.plan.generation_status === 'not_started' &&
      pendingItems.length > 0 &&
      preflight.ok,
    preflight,
    aiDesignedEnabled: isAiDesignedEnabled(),
  })
}

async function triggerWeekPlanProcessor(): Promise<void> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.stitchedup.app'
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return

  try {
    // Short timeout - queue-and-return only; cron continues processing if this aborts.
    await fetch(`${base}/api/cron/process-week-plan-generation`, {
      method: 'GET',
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5_000),
    })
  } catch (err) {
    console.warn('[WeekPlan][generate] Processor kick failed (non-fatal)', err)
  }
}
