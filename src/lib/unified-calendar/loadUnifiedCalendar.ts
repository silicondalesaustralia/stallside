import { requireOwner } from '@/lib/session'
import { resolveStandTimezone } from '@/lib/stand-timezone'
import { loadCalendarEvents } from '@/lib/calendar/load'
import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import { buildUnifiedItems } from './items'
import { loadSocialCalendarPosts } from './loadSocialCalendarPosts'
import { isDateKey, visibleRange } from './range'
import type { UnifiedItem, UnifiedView } from './types'

export type UnifiedCalendarSearchParams = Record<string, string | string[] | undefined>

export type UnifiedCalendarData = {
  items: UnifiedItem[]
  view: UnifiedView
  dateKey: string
  timeZone: string
  initialSelectedId: string | null
}

function param(sp: UnifiedCalendarSearchParams, key: string): string | undefined {
  const value = sp[key]
  return typeof value === 'string' ? value : undefined
}

/** `calendarWeekStart` / `calendarPostId` are deep links from Social (planner, posts). */
export async function loadUnifiedCalendar(
  sp: UnifiedCalendarSearchParams,
): Promise<UnifiedCalendarData> {
  const { owner } = await requireOwner()
  const timeZone = resolveStandTimezone(owner.defaultTimezone)
  const rawView = param(sp, 'view')
  const weekStart = param(sp, 'calendarWeekStart')
  const date = param(sp, 'date')
  const postId = param(sp, 'calendarPostId')

  const view: UnifiedView =
    rawView === 'month' ? 'month' : rawView || isDateKey(weekStart) ? 'week' : 'month'
  const dateKey = isDateKey(date)
    ? date
    : isDateKey(weekStart)
      ? weekStart
      : dateKeyInTimeZone(new Date(), timeZone)

  const { start, end } = visibleRange(view, dateKey, timeZone)
  const [events, posts] = await Promise.all([
    loadCalendarEvents({ ownerId: owner.id, start, end, timeZone, includeExternal: true }),
    loadSocialCalendarPosts(start, end),
  ])

  return {
    items: buildUnifiedItems(events, posts),
    view,
    dateKey,
    timeZone,
    initialSelectedId: postId ? `post:${postId}` : null,
  }
}
