import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { loadPlanForBusiness } from '@/lib/social/weekPlan/weekPlanService'
import {
  retryFailedWeekPlanItems,
  WeekPlanGenerationStartError,
} from '@/lib/social/weekPlan/startWeekPlanGeneration'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

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

  let body: { itemIds?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    // optional body
  }

  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds.filter((v): v is string => typeof v === 'string')
    : undefined

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

  if (loaded.plan.generation_status === 'queued' || loaded.plan.generation_status === 'generating') {
    return NextResponse.json({ error: 'Generation already in progress' }, { status: 409 })
  }

  try {
    const result = await retryFailedWeekPlanItems(db, loaded.plan, loaded.items, itemIds)
    logWeekBuilderAnalytics('week_generation_retry', {
      planId,
      businessId,
      itemCount: result.queuedCount,
    })

    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.stitchedup.app'
    const secret = process.env.CRON_SECRET?.trim()
    if (secret) {
      void fetch(`${base}/api/cron/process-week-plan-generation`, {
        method: 'GET',
        headers: { authorization: `Bearer ${secret}` },
      })
    }

    return NextResponse.json({ ok: true, planId, ...result })
  } catch (err) {
    if (err instanceof WeekPlanGenerationStartError) {
      if (err.status === 402) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 402 })
      }
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    console.error('[WeekPlan][retry-failed]', err)
    return NextResponse.json({ error: 'Could not retry failed posts' }, { status: 500 })
  }
}
