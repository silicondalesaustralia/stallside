import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  WeekPlanGenerationStatus,
  WeekPlanItemGenerationStatus,
  WeekPlanItemRow,
} from '@/lib/social/weekPlan/types'

export type WeekPlanGenerationProgress = {
  total: number
  generated: number
  failed: number
  queued: number
  generating: number
  notStarted: number
  previewCount: number
  creditsRequired: number
  planGenerationStatus: WeekPlanGenerationStatus
  items: Array<{
    id: string
    sortOrder: number
    topic: string
    targetDate: string
    generationStatus: WeekPlanItemGenerationStatus
    generationError: string | null
    variantCount: number
    hasCaption: boolean
  }>
}

export function computeWeekPlanGenerationProgress(
  planGenerationStatus: WeekPlanGenerationStatus,
  items: WeekPlanItemRow[],
): WeekPlanGenerationProgress {
  let generated = 0
  let failed = 0
  let queued = 0
  let generating = 0
  let notStarted = 0
  let previewCount = 0

  const mapped = items.map((item) => {
    switch (item.generation_status) {
      case 'generated':
        generated++
        previewCount += item.variant_previews?.length ?? 0
        break
      case 'failed':
        failed++
        break
      case 'queued':
        queued++
        break
      case 'generating':
        generating++
        break
      default:
        notStarted++
    }

    return {
      id: item.id,
      sortOrder: item.sort_order,
      topic: item.topic,
      targetDate: item.target_date,
      generationStatus: item.generation_status,
      generationError: item.generation_error,
      variantCount: item.variant_previews?.length ?? 0,
      hasCaption: Boolean(item.caption?.trim()),
    }
  })

  return {
    total: items.length,
    generated,
    failed,
    queued,
    generating,
    notStarted,
    previewCount,
    creditsRequired: items.length,
    planGenerationStatus,
    items: mapped,
  }
}

export async function syncPlanGenerationStatus(
  db: SupabaseClient,
  planId: string,
  businessId: string,
): Promise<WeekPlanGenerationStatus> {
  const { data: items, error } = await db
    .from('social_week_plan_items')
    .select('generation_status')
    .eq('plan_id', planId)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)
  const rows = items ?? []
  if (rows.length === 0) return 'not_started'

  const statuses = rows.map((r) => r.generation_status as WeekPlanItemGenerationStatus)
  const generated = statuses.filter((s) => s === 'generated').length
  const failed = statuses.filter((s) => s === 'failed').length
  const active = statuses.some((s) => s === 'queued' || s === 'generating')

  let next: WeekPlanGenerationStatus
  if (active) {
    next = statuses.some((s) => s === 'generating') ? 'generating' : 'queued'
  } else if (generated === rows.length) {
    next = 'ready'
  } else if (generated > 0 && failed > 0) {
    next = 'partial_failed'
  } else if (failed === rows.length) {
    next = 'failed'
  } else if (generated > 0) {
    next = 'partial_failed'
  } else {
    next = 'not_started'
  }

  const extra: Record<string, unknown> = { generation_status: next }
  if (next === 'ready') {
    extra.completed_at = new Date().toISOString()
  }

  const { error: updErr } = await db
    .from('social_week_plans')
    .update(extra)
    .eq('id', planId)
    .eq('business_id', businessId)

  if (updErr) throw new Error(updErr.message)
  return next
}
