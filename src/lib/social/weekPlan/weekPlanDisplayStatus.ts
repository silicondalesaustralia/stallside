import type {
  WeekPlanItemRow,
  WeekPlanRow,
} from '@/lib/social/weekPlan/types'

export type WeekPlanDisplayStatus =
  | 'Draft'
  | 'Plan approved'
  | 'Generating'
  | 'Ready to review'
  | 'Partial failure'
  | 'Failed'
  | 'Archived'

export function weekPlanDisplayStatus(
  plan: Pick<WeekPlanRow, 'status' | 'generation_status'>,
): WeekPlanDisplayStatus {
  if (plan.status === 'archived') return 'Archived'
  if (plan.generation_status === 'ready') return 'Ready to review'
  if (plan.generation_status === 'partial_failed') return 'Partial failure'
  if (plan.generation_status === 'failed') return 'Failed'
  if (plan.generation_status === 'queued' || plan.generation_status === 'generating') {
    return 'Generating'
  }
  if (plan.status === 'plan_approved') return 'Plan approved'
  return 'Draft'
}

export function weekPlanStatusDetail(
  plan: Pick<WeekPlanRow, 'status' | 'generation_status'>,
  items: Pick<WeekPlanItemRow, 'generation_status'>[],
): string | null {
  const display = weekPlanDisplayStatus(plan)
  if (display === 'Generating') {
    const generated = items.filter((i) => i.generation_status === 'generated').length
    const total = items.length
    if (total > 0) return `${generated} of ${total} ready`
  }
  if (display === 'Partial failure') {
    const failed = items.filter((i) => i.generation_status === 'failed').length
    return `${failed} need retry`
  }
  return null
}

export function countVariantPreviews(items: Pick<WeekPlanItemRow, 'variant_previews'>[]): number {
  return items.reduce((n, i) => n + (i.variant_previews?.length ?? 0), 0)
}
