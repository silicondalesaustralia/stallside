import { dateKeyInTimeZone, localDateTimeToUtc } from '@/lib/utils/australiaSydneyTime'
import {
  addDaysToDateKey,
  formatWeekRangeCompact,
  mondayOfWeekContaining,
  weekEndSunday,
} from '@/lib/social/weekPlan/weekIdentity'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'
import { weekPlanDisplayStatus } from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import { weekPlanItemCardStatus } from '@/lib/social/weekPlan/weekPlanItemReviewLabel'
import { WEEK_PLAN_POST_TYPE_LABELS } from '@/lib/social/weekPlan/postTypeMapping'
import type { WeekPlanItemRow, WeekPlanPostType } from '@/lib/social/weekPlan/types'
import type { TradiesPostStatus } from '@/lib/tradiespost/status'

export type MonthWeekSlotStatus =
  | 'empty'
  | 'planned'
  | 'needs_review'
  | 'approved'
  | 'scheduled'
  | 'complete'

const SLOT_STATUS_LABELS: Record<MonthWeekSlotStatus, string> = {
  empty: 'Empty',
  planned: 'Planned',
  needs_review: 'Needs review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  complete: 'Complete',
}

export function monthWeekSlotStatusLabel(status: MonthWeekSlotStatus): string {
  return SLOT_STATUS_LABELS[status]
}

export function getWeekPlanItemImageUrl(item: WeekPlanItemRow): string | null {
  const previews = item.variant_previews ?? []
  if (item.selected_variant_id) {
    const selected = previews.find((p) => p.id === item.selected_variant_id)
    if (selected?.imageUrl) return selected.imageUrl
  }
  return previews[0]?.imageUrl ?? null
}

export function mapWeekPlanItemToTpStatus(item: WeekPlanItemRow): TradiesPostStatus {
  const card = weekPlanItemCardStatus(item)
  switch (card) {
    case 'Scheduled':
      return 'scheduled'
    case 'Approved':
      return 'approved'
    case 'Selected':
      return 'ready'
    case 'Failed':
      return 'failed'
    case 'Generating':
      return 'draft'
    case 'Skipped':
      return 'draft'
    default:
      return 'needs_review'
  }
}

export function formatPlannerDayShort(dateKey: string, timeZone: string): string {
  const ms = localDateTimeToUtc(dateKey, '12:00', timeZone).getTime()
  return new Intl.DateTimeFormat('en-AU', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
  }).format(new Date(ms))
}

/** "7-13 September" (no year) for week cards. */
export function formatWeekRangeMonthLabel(weekStartMonday: string, timeZone: string): string {
  const end = weekEndSunday(weekStartMonday, timeZone)
  const startMs = localDateTimeToUtc(weekStartMonday, '12:00', timeZone).getTime()
  const endMs = localDateTimeToUtc(end, '12:00', timeZone).getTime()
  const startDay = new Intl.DateTimeFormat('en-AU', { timeZone, day: 'numeric' }).format(
    new Date(startMs),
  )
  const endDay = new Intl.DateTimeFormat('en-AU', { timeZone, day: 'numeric' }).format(
    new Date(endMs),
  )
  const endMonth = new Intl.DateTimeFormat('en-AU', { timeZone, month: 'long' }).format(
    new Date(endMs),
  )
  const startMonth = new Intl.DateTimeFormat('en-AU', { timeZone, month: 'long' }).format(
    new Date(startMs),
  )
  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${endMonth}`
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
}

function monthYearFromNow(timeZone: string, nowMs = Date.now()): { year: number; month: number } {
  const today = dateKeyInTimeZone(new Date(nowMs), timeZone)
  const [year, month] = today.split('-').map(Number)
  return { year, month }
}

function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/** Up to four Monday week-starts overlapping the current calendar month. */
export function mondayWeekStartsInCurrentMonth(
  timeZone: string,
  nowMs = Date.now(),
): string[] {
  const { year, month } = monthYearFromNow(timeZone, nowMs)
  const firstOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const lastOfMonth = lastDayOfMonth(year, month)
  let monday = mondayOfWeekContaining(firstOfMonth, timeZone)
  const mondays: string[] = []

  for (let i = 0; i < 6 && mondays.length < 4; i += 1) {
    const weekEnd = weekEndSunday(monday, timeZone)
    const overlaps =
      (monday >= firstOfMonth && monday <= lastOfMonth) ||
      (weekEnd >= firstOfMonth && weekEnd <= lastOfMonth) ||
      (monday <= firstOfMonth && weekEnd >= lastOfMonth)
    if (overlaps) mondays.push(monday)
    monday = addDaysToDateKey(monday, 7, timeZone)
    if (monday > addDaysToDateKey(lastOfMonth, 7, timeZone)) break
  }

  return mondays.slice(0, 4)
}

export function currentMonthLabel(timeZone: string, nowMs = Date.now()): string {
  const today = dateKeyInTimeZone(new Date(nowMs), timeZone)
  const ms = localDateTimeToUtc(today, '12:00', timeZone).getTime()
  return new Intl.DateTimeFormat('en-AU', { timeZone, month: 'long' }).format(new Date(ms))
}

export function weekSlotStatus(entry: WeekPlanListEntry | undefined): MonthWeekSlotStatus {
  if (!entry) return 'empty'
  const { plan, items } = entry
  if (plan.status === 'archived') return 'complete'

  const display = weekPlanDisplayStatus(plan)
  if (display === 'Ready to review' || display === 'Partial failure') return 'needs_review'
  if (display === 'Draft' || display === 'Plan approved' || display === 'Generating') {
    return 'planned'
  }
  if (display === 'Failed') return 'needs_review'

  if (items.length === 0) return 'planned'

  const active = items.filter((i) => i.review_status !== 'skipped')
  if (active.length === 0) return 'complete'

  const allScheduled = active.every((i) => i.review_status === 'scheduled')
  if (allScheduled) return 'scheduled'

  const allApprovedOrBeyond = active.every((i) =>
    ['approved', 'scheduled'].includes(i.review_status),
  )
  if (allApprovedOrBeyond) return 'approved'

  return 'needs_review'
}

export type MonthWeekSlot = {
  index: number
  weekStart: string
  status: MonthWeekSlotStatus
  entry: WeekPlanListEntry | undefined
}

export function buildMonthWeekSlots(
  entries: WeekPlanListEntry[],
  timeZone: string,
  nowMs = Date.now(),
): MonthWeekSlot[] {
  const mondays = mondayWeekStartsInCurrentMonth(timeZone, nowMs)
  const byStart = new Map(entries.map((e) => [e.plan.week_start_date, e]))

  return mondays.map((weekStart, index) => ({
    index: index + 1,
    weekStart,
    entry: byStart.get(weekStart),
    status: weekSlotStatus(byStart.get(weekStart)),
  }))
}

export function computeMonthSortedPercent(entries: WeekPlanListEntry[]): number {
  const items = entries.flatMap((e) => e.items)
  if (items.length === 0) return 0
  const sorted = items.filter((i) =>
    ['approved', 'scheduled', 'skipped'].includes(i.review_status),
  ).length
  return Math.round((sorted / items.length) * 100)
}

export function entriesInCurrentMonth(
  entries: WeekPlanListEntry[],
  timeZone: string,
  nowMs = Date.now(),
): WeekPlanListEntry[] {
  const { year, month } = monthYearFromNow(timeZone, nowMs)
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

  return entries.filter((e) => {
    const weekStart = e.plan.week_start_date
    const weekEnd = weekEndSunday(weekStart, timeZone)
    return weekStart.startsWith(monthPrefix) || weekEnd.startsWith(monthPrefix)
  })
}

export type ContentMixRow = {
  label: string
  count: number
}

const CONTENT_MIX_DISPLAY: Partial<Record<WeekPlanPostType, string>> = {
  recent_job: 'Completed jobs',
  tips_advice: 'Tips',
  team_business: 'Reviews',
  promotions: 'Offers',
  services: 'Services',
  seasonal: 'Seasonal',
}

export function computeContentMix(entries: WeekPlanListEntry[]): ContentMixRow[] {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    for (const item of entry.items) {
      const label =
        CONTENT_MIX_DISPLAY[item.post_type] ??
        WEEK_PLAN_POST_TYPE_LABELS[item.post_type] ??
        item.post_type
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export function countScheduledItems(entry: WeekPlanListEntry): number {
  return entry.items.filter((i) => i.review_status === 'scheduled').length
}

export function weekCardStatusLabel(entry: WeekPlanListEntry): string {
  return weekPlanDisplayStatus(entry.plan)
}

/** Compact range for past week cards - reuse existing helper. */
export { formatWeekRangeCompact }
