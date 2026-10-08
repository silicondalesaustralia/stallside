import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'

export type PlannerOverflowAction =
  | 'chooseAgain'
  | 'startAgain'
  | 'skip'
  | 'move'
  | 'cancelSchedule'
  | 'viewPublished'

export type PlannerCardActions = {
  statusLabel: string
  statusClass: string
  primaryLabel: string | null
  primaryKind:
    | 'approveAndSchedule'
    | 'addToCalendar'
    | 'viewInCalendar'
    | 'markPosted'
    | 'viewPublished'
    | null
  secondaryLabel: string | null
  secondaryKind: 'approveOnly' | 'changeDesign' | 'markPosted' | null
  overflow: PlannerOverflowAction[]
  showQuickChange: boolean
  showDesignPicker: boolean
  showCaptionEditor: boolean
}

type ScheduledInfo = {
  scheduled_for: string | null
  publishing_mode?: string | null
  status?: string
} | null

function formatScheduledStatus(
  scheduledPost: ScheduledInfo,
  publishState?: string,
): { label: string; cls: string } {
  if (publishState?.includes('Posted manually')) {
    return { label: 'Posted manually', cls: 'text-green-700 bg-green-50' }
  }
  if (publishState === 'Published' || publishState?.includes('Published')) {
    return { label: 'Published', cls: 'text-green-700 bg-green-50' }
  }
  if (scheduledPost?.status === 'scheduled' || publishState?.includes('due') || publishState?.includes('Scheduled')) {
    const manual =
      scheduledPost?.publishing_mode === 'manual' ||
      publishState?.toLowerCase().includes('manual')
    return {
      label: manual ? 'Manual · scheduled' : 'Automatic · scheduled',
      cls: 'text-green-700 bg-green-50',
    }
  }
  return { label: 'Scheduled', cls: 'text-green-700 bg-green-50' }
}

export function derivePlannerCardActions(input: {
  item: WeekPlanItemRow
  readOnly: boolean
  publishState?: string
  scheduledPost: ScheduledInfo
  hasPreviews: boolean
}): PlannerCardActions {
  const { item, readOnly, publishState, scheduledPost, hasPreviews } = input

  const base: PlannerCardActions = {
    statusLabel: 'Needs a design',
    statusClass: 'text-[#666] bg-[#F5F3ED]',
    primaryLabel: null,
    primaryKind: null,
    secondaryLabel: null,
    secondaryKind: null,
    overflow: [],
    showQuickChange: false,
    showDesignPicker: false,
    showCaptionEditor: false,
  }

  if (item.review_status === 'skipped') {
    return {
      ...base,
      statusLabel: 'Skipped',
      statusClass: 'text-gray-600 bg-gray-100',
    }
  }

  if (item.generation_status === 'failed') {
    return {
      ...base,
      statusLabel: 'Generation failed',
      statusClass: 'text-red-600 bg-red-50',
      overflow: readOnly ? [] : ['startAgain'],
    }
  }

  if (item.generation_status === 'generating' || item.generation_status === 'queued') {
    return {
      ...base,
      statusLabel: 'Generating designs',
      statusClass: 'text-[#886600] bg-[#FFFBEA]',
    }
  }

  if (publishState === 'Posted manually' || publishState === 'Published' || publishState?.includes('Posted') || publishState?.includes('Published')) {
    return {
      ...base,
      statusLabel: publishState === 'Posted manually' || publishState === 'Published'
        ? publishState
        : 'Published',
      statusClass: 'text-green-700 bg-green-50',
      primaryLabel: 'View published history',
      primaryKind: 'viewPublished',
      overflow: readOnly ? [] : ['startAgain'],
      showCaptionEditor: true,
    }
  }

  if (item.review_status === 'scheduled' || item.scheduled_social_post_id) {
    const st = formatScheduledStatus(scheduledPost, publishState)
    const manual = scheduledPost?.publishing_mode === 'manual'
    return {
      ...base,
      statusLabel: st.label,
      statusClass: st.cls,
      primaryLabel: 'View in Calendar',
      primaryKind: 'viewInCalendar',
      secondaryLabel: manual ? 'Mark as posted' : null,
      secondaryKind: manual ? 'markPosted' : null,
      overflow: readOnly
        ? []
        : ['move', 'cancelSchedule', 'chooseAgain', 'startAgain'],
      showCaptionEditor: true,
    }
  }

  if (item.review_status === 'approved') {
    return {
      ...base,
      statusLabel: 'Approved',
      statusClass: 'text-blue-700 bg-blue-50',
      primaryLabel: readOnly ? null : 'Add to Calendar',
      primaryKind: readOnly ? null : 'addToCalendar',
      secondaryLabel: readOnly ? null : 'Change design',
      secondaryKind: readOnly ? null : 'changeDesign',
      overflow: readOnly ? [] : ['startAgain', 'skip'],
      showQuickChange: !readOnly,
      showDesignPicker: hasPreviews,
      showCaptionEditor: !readOnly,
    }
  }

  if (item.review_status === 'selected') {
    return {
      ...base,
      statusLabel: 'Ready to approve',
      statusClass: 'text-[#886600] bg-[#FFFBEA]',
      primaryLabel: readOnly ? null : 'Approve & Schedule',
      primaryKind: readOnly ? null : 'approveAndSchedule',
      secondaryLabel: readOnly ? null : 'Approve only',
      secondaryKind: readOnly ? null : 'approveOnly',
      overflow: readOnly ? [] : ['chooseAgain', 'startAgain', 'skip'],
      showQuickChange: !readOnly,
      showDesignPicker: hasPreviews,
      showCaptionEditor: !readOnly,
    }
  }

  return {
    ...base,
    statusLabel: hasPreviews && item.selected_variant_id ? 'Ready to approve' : 'Needs a design',
    statusClass: 'text-[#666] bg-[#F5F3ED]',
    primaryLabel: null,
    primaryKind: null,
    overflow: readOnly ? [] : ['skip'],
    showQuickChange: !readOnly && hasPreviews,
    showDesignPicker: hasPreviews,
    showCaptionEditor: !readOnly && Boolean(item.caption),
  }
}
