import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'

export type WeekPlanItemCardStatus =
  | 'Generating'
  | 'Failed'
  | 'Needs selection'
  | 'Selected'
  | 'Approved'
  | 'Scheduled'
  | 'Skipped'

export function weekPlanItemCardStatus(item: WeekPlanItemRow): WeekPlanItemCardStatus {
  if (item.review_status === 'skipped') return 'Skipped'
  if (item.review_status === 'scheduled') return 'Scheduled'
  if (item.review_status === 'approved') return 'Approved'
  if (item.review_status === 'selected') return 'Selected'
  if (item.generation_status === 'failed') return 'Failed'
  if (item.generation_status === 'generating' || item.generation_status === 'queued') {
    return 'Generating'
  }
  return 'Needs selection'
}

export function weekPlanItemCardStatusClass(status: WeekPlanItemCardStatus): string {
  switch (status) {
    case 'Scheduled':
      return 'text-green-700 bg-green-50'
    case 'Approved':
      return 'text-blue-700 bg-blue-50'
    case 'Selected':
      return 'text-[#886600] bg-[#FFFBEA]'
    case 'Skipped':
      return 'text-gray-600 bg-gray-100'
    case 'Failed':
      return 'text-red-600 bg-red-50'
    case 'Generating':
      return 'text-[#886600] bg-[#FFFBEA]'
    default:
      return 'text-[#666] bg-[#F5F3ED]'
  }
}
