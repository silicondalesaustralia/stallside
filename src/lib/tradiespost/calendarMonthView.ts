import { dateKeyInTimeZone, localDateTimeToUtc } from '@/lib/utils/australiaSydneyTime'
import {
  addDaysToDateKey,
  mondayOfWeekContaining,
  resolveBusinessTimeZone,
} from '@/lib/social/weekPlan/weekIdentity'
import { scheduledDateKey, type CalendarPostLike } from '@/lib/social/socialCalendar'

/** YYYY-MM-01 for the month containing `now` in business timezone. */
export function defaultCalendarMonthAnchor(timeZone: string, now = new Date()): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const today = dateKeyInTimeZone(now, tz)
  const [year, month] = today.split('-').map(Number)
  return `${year}-${String(month).padStart(2, '0')}-01`
}

export function monthPrefixFromAnchor(anchorDateKey: string): string {
  return anchorDateKey.slice(0, 7)
}

export function isDateInMonth(dateKey: string, monthAnchor: string): boolean {
  return dateKey.startsWith(monthPrefixFromAnchor(monthAnchor))
}

export function shiftCalendarMonth(
  monthAnchor: string,
  deltaMonths: number,
  timeZone: string,
): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const [year, month] = monthAnchor.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1 + deltaMonths, 1, 12, 0, 0))
  const nextKey = dateKeyInTimeZone(d, tz)
  const [y, m] = nextKey.split('-').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-01`
}

export function formatCalendarMonthHeading(monthAnchor: string, timeZone: string): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const ms = localDateTimeToUtc(monthAnchor, '12:00', tz).getTime()
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    month: 'long',
    year: 'numeric',
  }).format(new Date(ms))
}

/** Up to 6 calendar rows (Mon-Sun), including leading/trailing days from adjacent months. */
export function buildMonthWeekRows(monthAnchor: string, timeZone: string): string[][] {
  const tz = resolveBusinessTimeZone(timeZone)
  const [year, month] = monthAnchor.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const lastOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  let cursor = mondayOfWeekContaining(monthAnchor, tz)
  const rows: string[][] = []

  while (rows.length < 6) {
    const row: string[] = []
    for (let i = 0; i < 7; i += 1) {
      row.push(cursor)
      cursor = addDaysToDateKey(cursor, 1, tz)
    }
    rows.push(row)
    if (cursor > addDaysToDateKey(lastOfMonth, 7, tz)) break
  }

  return rows
}

export function postsScheduledInMonth<T extends CalendarPostLike>(
  posts: T[],
  monthAnchor: string,
  timeZone: string,
): T[] {
  const tz = resolveBusinessTimeZone(timeZone)
  const prefix = monthPrefixFromAnchor(monthAnchor)
  return posts.filter((p) => {
    if (!p.scheduled_for) return false
    return scheduledDateKey(p.scheduled_for, tz).startsWith(prefix)
  })
}

export function groupPostsByDayKeys<T extends CalendarPostLike>(
  posts: T[],
  dayKeys: string[],
  timeZone: string,
): Map<string, T[]> {
  const tz = resolveBusinessTimeZone(timeZone)
  const map = new Map<string, T[]>()
  for (const day of dayKeys) map.set(day, [])

  for (const post of posts) {
    if (!post.scheduled_for) continue
    const dayKey = scheduledDateKey(post.scheduled_for, tz)
    if (!map.has(dayKey)) continue
    map.get(dayKey)!.push(post)
  }

  for (const [day, list] of map.entries()) {
    list.sort(
      (a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime(),
    )
    map.set(day, list)
  }

  return map
}

export const CALENDAR_PLATFORM_LABELS: Record<string, string> = {
  facebook: 'FB',
  instagram: 'IG',
  gmb: 'GMB',
}

export function calendarPlatformLabels(platforms: string[]): string[] {
  return platforms.map((p) => CALENDAR_PLATFORM_LABELS[p] ?? p.slice(0, 3).toUpperCase())
}
