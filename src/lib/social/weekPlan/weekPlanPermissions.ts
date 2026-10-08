import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'
import type { SocialConnectionState } from '@/lib/social/libraryPublish'
import {
  isPublishedHistoryImmutable,
  type SocialPostRow,
} from '@/lib/social/socialPostTypes'

export type LinkedPostSnapshot = Pick<
  SocialPostRow,
  'id' | 'status' | 'publishing_mode' | 'scheduled_for' | 'posted_at' | 'posted_manually' | 'platforms'
> | null

export function isWeekPlanArchived(plan: Pick<WeekPlanRow, 'status'>): boolean {
  return plan.status === 'archived'
}

export function isWeekPlanReadOnly(plan: Pick<WeekPlanRow, 'status'>): boolean {
  return plan.status === 'archived'
}

/** Blocks selection/caption/approve - not reset/move actions. */
export function isItemEditingLocked(item: WeekPlanItemRow): boolean {
  return item.review_status === 'scheduled' || item.review_status === 'skipped'
}

export function linkedPostIsFutureScheduled(post: LinkedPostSnapshot): boolean {
  if (!post || post.status !== 'scheduled' || !post.scheduled_for) return false
  return new Date(post.scheduled_for).getTime() > Date.now()
}

export function canChooseAgain(
  plan: Pick<WeekPlanRow, 'status'>,
  item: WeekPlanItemRow,
  linkedPost: LinkedPostSnapshot,
): boolean {
  if (isWeekPlanReadOnly(plan)) return false
  if (item.review_status === 'skipped') return false
  if (linkedPost && isPublishedHistoryImmutable(linkedPost)) {
    return item.review_status !== 'needs_selection' || Boolean(item.selected_variant_id)
  }
  return (
    item.generation_status === 'generated' &&
    (item.review_status === 'selected' ||
      item.review_status === 'approved' ||
      item.review_status === 'scheduled')
  )
}

export function canStartAgain(
  plan: Pick<WeekPlanRow, 'status'>,
  item: WeekPlanItemRow,
): boolean {
  if (isWeekPlanReadOnly(plan)) return false
  if (item.review_status === 'skipped') return false
  return item.generation_status === 'generated' || item.generation_status === 'failed'
}

export function canMovePost(
  plan: Pick<WeekPlanRow, 'status'>,
  item: WeekPlanItemRow,
  linkedPost: LinkedPostSnapshot,
): boolean {
  if (isWeekPlanReadOnly(plan)) return false
  if (linkedPost && isPublishedHistoryImmutable(linkedPost)) return false
  if (linkedPost?.status === 'scheduled') return true
  return item.review_status !== 'skipped'
}

export function canCancelSchedule(linkedPost: LinkedPostSnapshot): boolean {
  return linkedPost?.status === 'scheduled'
}

export function canMarkManualPosted(linkedPost: LinkedPostSnapshot): boolean {
  return (
    linkedPost?.status === 'scheduled' &&
    linkedPost.publishing_mode === 'manual'
  )
}

export function canResetWeekSelections(plan: Pick<WeekPlanRow, 'status'>): boolean {
  return !isWeekPlanReadOnly(plan)
}

export function canRebuildWeek(plan: Pick<WeekPlanRow, 'status'>): boolean {
  return !isWeekPlanReadOnly(plan)
}

export type DerivedPlannerPublishState =
  | 'Not scheduled'
  | 'Scheduled automatically'
  | 'Manual post due'
  | 'Posted manually'
  | 'Published'
  | 'Publish failed'
  | 'Cancelled'

export function derivePlannerPublishState(
  item: WeekPlanItemRow,
  linkedPost: LinkedPostSnapshot,
  publishedViaItemLink: LinkedPostSnapshot,
): DerivedPlannerPublishState {
  const active = linkedPost ?? publishedViaItemLink

  if (!active) {
    if (item.review_status === 'scheduled') return 'Scheduled automatically'
    return 'Not scheduled'
  }

  if (active.status === 'posted') {
    return active.posted_manually ? 'Posted manually' : 'Published'
  }
  if (active.status === 'failed') return 'Publish failed'
  if (active.status === 'cancelled') return 'Cancelled'
  if (active.status === 'scheduled') {
    if (active.publishing_mode === 'manual') {
      return 'Manual post due'
    }
    return 'Scheduled automatically'
  }
  return 'Not scheduled'
}

export function automaticPostingAvailable(
  selectedPlatforms: string[],
  connected: SocialConnectionState,
): boolean {
  if (selectedPlatforms.length === 0) return false
  return selectedPlatforms.every((p) => {
    if (p === 'facebook') return connected.facebook
    if (p === 'instagram') return connected.instagram
    if (p === 'gmb') return connected.gmb
    return false
  })
}

export function defaultPlannerPublishingMode(
  selectedPlatforms: string[],
  connected: SocialConnectionState,
): 'automatic' | 'manual' {
  return automaticPostingAvailable(selectedPlatforms, connected) ? 'automatic' : 'manual'
}
