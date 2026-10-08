import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import {
  claimNextWeekPlanItem,
  recoverStaleWeekPlanItems,
} from '@/lib/social/weekPlan/claimWeekPlanItem'
import { processWeekPlanItem } from '@/lib/social/weekPlan/processWeekPlanItem'

export const runtime = 'nodejs'
export const maxDuration = 300

/** Cron / internal - claim and process one queued week-plan item. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  const workerId = `week-plan-${randomUUID().slice(0, 8)}`

  try {
    const recovered = await recoverStaleWeekPlanItems(db)
    const item = await claimNextWeekPlanItem(db, workerId)

    if (!item) {
      return NextResponse.json({
        ok: true,
        processed: false,
        recovered,
        timestamp: new Date().toISOString(),
      })
    }

    const result = await processWeekPlanItem(db, item)

    console.log('[Cron process-week-plan-generation]', {
      workerId,
      itemId: item.id,
      ok: result.ok,
      recovered,
    })

    return NextResponse.json({
      ok: true,
      processed: true,
      recovered,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Cron process-week-plan-generation] Failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
