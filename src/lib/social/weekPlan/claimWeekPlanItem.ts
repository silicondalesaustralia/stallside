import type { SupabaseClient } from '@supabase/supabase-js'
import { serializeItemRow } from '@/lib/social/weekPlan/weekPlanService'
import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'

const STALE_GENERATING_MS = 15 * 60 * 1000

export async function recoverStaleWeekPlanItems(db: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_GENERATING_MS).toISOString()

  const { data: stale, error } = await db
    .from('social_week_plan_items')
    .select('id, business_id, plan_id')
    .eq('generation_status', 'generating')
    .lt('generation_started_at', cutoff)

  if (error) throw new Error(error.message)
  if (!stale?.length) return 0

  let recovered = 0
  for (const row of stale) {
    const { data: updated } = await db
      .from('social_week_plan_items')
      .update({
        generation_status: 'queued',
        generation_error: 'Generation timed out - retrying',
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('generation_status', 'generating')
      .select('id')
      .maybeSingle()

    if (updated) recovered++
  }

  return recovered
}

/**
 * Claim one queued item via Postgres RPC:
 * - skips plans that already have a generating item (V1 per-plan concurrency)
 * - FOR UPDATE SKIP LOCKED prevents double-claim across concurrent cron invocations
 * - partial unique index on (plan_id) WHERE generating is belt-and-suspenders
 */
export async function claimNextWeekPlanItem(
  db: SupabaseClient,
  workerId: string,
): Promise<WeekPlanItemRow | null> {
  const { data, error } = await db.rpc('claim_next_social_week_plan_item')

  if (error) throw new Error(error.message)

  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object') return null

  console.log('[WeekPlan][worker] Claimed item', {
    workerId,
    itemId: (row as { id: string }).id,
    planId: (row as { plan_id: string }).plan_id,
    businessId: (row as { business_id: string }).business_id,
  })

  return serializeItemRow(row as Record<string, unknown>)
}
