import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { preflightWeekPlanGenerationCredits } from '@/lib/social/weekPlan/weekPlanGenerationPreflight'
import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'

export class WeekPlanGenerationStartError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status = 400) {
    super(message)
    this.name = 'WeekPlanGenerationStartError'
    this.code = code
    this.status = status
  }
}

export async function startWeekPlanGeneration(
  db: SupabaseClient,
  plan: WeekPlanRow,
  items: WeekPlanItemRow[],
  options?: { retryFailedOnly?: boolean },
): Promise<{ queuedCount: number; creditsRequired: number; previewCount: number }> {
  const retryFailedOnly = options?.retryFailedOnly === true

  if (plan.status !== 'plan_approved') {
    throw new WeekPlanGenerationStartError('Plan must be approved before generation', 'not_approved')
  }

  if (plan.generation_status === 'ready') {
    throw new WeekPlanGenerationStartError('Week already generated', 'already_ready', 409)
  }

  if (plan.generation_status === 'queued' || plan.generation_status === 'generating') {
    throw new WeekPlanGenerationStartError('Generation already in progress', 'already_running', 409)
  }

  if (plan.generation_status !== 'not_started' && plan.generation_status !== 'failed') {
    throw new WeekPlanGenerationStartError('Generation already started or completed', 'already_started', 409)
  }

  const targetItems = retryFailedOnly
    ? items.filter((i) => i.generation_status === 'failed')
    : items.filter((i) => i.generation_status === 'not_started')

  if (targetItems.length === 0) {
    throw new WeekPlanGenerationStartError('No posts to generate', 'nothing_to_generate')
  }

  if (!retryFailedOnly && targetItems.length !== items.length) {
    throw new WeekPlanGenerationStartError(
      'Some posts already have generation state - refresh and retry failed only',
      'partial_state',
      409,
    )
  }

  const preflight = await preflightWeekPlanGenerationCredits(
    db,
    plan.business_id,
    targetItems.length,
  )
  if (!preflight.ok) {
    throw new WeekPlanGenerationStartError(
      preflight.code === 'no_render_credits'
        ? 'Not enough render credits for this week'
        : 'Not enough usage balance for this week',
      preflight.code,
      402,
    )
  }

  const now = new Date().toISOString()

  for (const item of targetItems) {
    const generationId = randomUUID()

    const { error } = await db
      .from('social_week_plan_items')
      .update({
        generation_id: generationId,
        generation_status: 'queued',
        generation_error: null,
        generation_started_at: null,
        generation_completed_at: null,
        variant_previews: null,
        caption: null,
      })
      .eq('id', item.id)
      .eq('business_id', plan.business_id)
      .eq('generation_status', item.generation_status)

    if (error) throw new Error(error.message)
  }

  const { error: planErr } = await db
    .from('social_week_plans')
    .update({
      generation_status: 'queued',
      generation_started_at: plan.generation_started_at ?? now,
      completed_at: null,
    })
    .eq('id', plan.id)
    .eq('business_id', plan.business_id)

  if (planErr) throw new Error(planErr.message)

  return {
    queuedCount: targetItems.length,
    creditsRequired: preflight.creditsRequired,
    previewCount: preflight.previewCount,
  }
}

export async function retryFailedWeekPlanItems(
  db: SupabaseClient,
  plan: WeekPlanRow,
  items: WeekPlanItemRow[],
  itemIds?: string[],
): Promise<{ queuedCount: number; creditsRequired: number; previewCount: number }> {
  const failed = items.filter((i) => i.generation_status === 'failed')
  const targets = itemIds?.length
    ? failed.filter((i) => itemIds.includes(i.id))
    : failed

  if (targets.length === 0) {
    throw new WeekPlanGenerationStartError('No failed posts to retry', 'nothing_to_retry')
  }

  const preflight = await preflightWeekPlanGenerationCredits(
    db,
    plan.business_id,
    targets.length,
  )
  if (!preflight.ok) {
    throw new WeekPlanGenerationStartError(
      'Not enough render credits to retry failed posts',
      preflight.code,
      402,
    )
  }

  const now = new Date().toISOString()
  for (const item of targets) {
    const { error } = await db
      .from('social_week_plan_items')
      .update({
        generation_status: 'queued',
        generation_error: null,
        generation_started_at: null,
        generation_completed_at: null,
      })
      .eq('id', item.id)
      .eq('business_id', plan.business_id)
      .eq('generation_status', 'failed')

    if (error) throw new Error(error.message)
  }

  const { error: planErr } = await db
    .from('social_week_plans')
    .update({
      generation_status: 'queued',
      generation_started_at: plan.generation_started_at ?? now,
      completed_at: null,
    })
    .eq('id', plan.id)
    .eq('business_id', plan.business_id)

  if (planErr) throw new Error(planErr.message)

  return {
    queuedCount: targets.length,
    creditsRequired: preflight.creditsRequired,
    previewCount: preflight.previewCount,
  }
}
