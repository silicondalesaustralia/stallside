import { getZonedHourMinute } from '@/lib/utils/australiaSydneyTime'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import {
  type CalendarPostLike,
  calendarPostTitle,
  formatCalendarPostTime,
  postingModeLabel,
  scheduledDateKey,
} from '@/lib/social/socialCalendar'

/** Default visible hours: 7:00 AM through 9:00 PM (inclusive). */
export const DEFAULT_CALENDAR_START_HOUR = 7
export const DEFAULT_CALENDAR_END_HOUR = 22 // exclusive - rows 7..21

export type CalendarDayHeaderParts = {
  weekday: string
  date: string
  isToday: boolean
}

export function resolveCalendarHourRange(
  posts: CalendarPostLike[],
  weekDays: string[],
  timeZone: string,
  defaultStart = DEFAULT_CALENDAR_START_HOUR,
  defaultEndExclusive = DEFAULT_CALENDAR_END_HOUR,
): { startHour: number; endHourExclusive: number } {
  let startHour = defaultStart
  let endHourExclusive = defaultEndExclusive
  const tz = resolveBusinessTimeZone(timeZone)

  for (const post of posts) {
    if (!post.scheduled_for) continue
    const dayKey = scheduledDateKey(post.scheduled_for, tz)
    if (!weekDays.includes(dayKey)) continue
    const { hour } = getZonedHourMinute(post.scheduled_for, tz)
    if (hour < startHour) startHour = hour
    if (hour + 1 > endHourExclusive) endHourExclusive = hour + 1
  }

  return { startHour, endHourExclusive }
}

export function buildCalendarHourRange(startHour: number, endHourExclusive: number): number[] {
  const hours: number[] = []
  for (let h = startHour; h < endHourExclusive; h++) hours.push(h)
  return hours
}

export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:00 ${period}`
}

/** dayKey -> hour -> posts (sorted by minute within hour). */
export function assignPostsToWeekGrid<T extends CalendarPostLike>(
  posts: T[],
  weekDays: string[],
  timeZone: string,
): Map<string, Map<number, T[]>> {
  const tz = resolveBusinessTimeZone(timeZone)
  const grid = new Map<string, Map<number, T[]>>()
  for (const day of weekDays) grid.set(day, new Map())

  for (const post of posts) {
    if (!post.scheduled_for) continue
    const dayKey = scheduledDateKey(post.scheduled_for, tz)
    if (!weekDays.includes(dayKey)) continue
    const { hour } = getZonedHourMinute(post.scheduled_for, tz)
    const dayMap = grid.get(dayKey)!
    if (!dayMap.has(hour)) dayMap.set(hour, [])
    dayMap.get(hour)!.push(post)
  }

  for (const dayMap of grid.values()) {
    for (const [hour, list] of dayMap.entries()) {
      list.sort((a, b) => {
        const ma = getZonedHourMinute(a.scheduled_for!, tz)
        const mb = getZonedHourMinute(b.scheduled_for!, tz)
        return ma.minute - mb.minute || a.id.localeCompare(b.id)
      })
      dayMap.set(hour, list)
    }
  }

  return grid
}

export function formatCompactDayHeader(
  dateKey: string,
  timeZone: string,
  isToday: boolean,
): CalendarDayHeaderParts {
  const tz = resolveBusinessTimeZone(timeZone)
  const ms = new Date(`${dateKey}T12:00:00`).getTime()
  const weekday = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'short',
  })
    .format(new Date(ms))
    .toUpperCase()
  const date = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(ms))
    .toUpperCase()
  return { weekday, date, isToday }
}

export function formatPlatformList(platforms: string[]): string {
  const map: Record<string, string> = {
    facebook: 'FB',
    instagram: 'IG',
    gmb: 'GMB',
  }
  return platforms.map((p) => map[p] ?? p.toUpperCase()).join(' · ')
}

export function calendarEventAriaLabel(
  post: CalendarPostLike,
  timeZone: string,
): string {
  const mode = postingModeLabel(post.publishing_mode)
  const platforms = formatPlatformList(post.platforms)
  const title = calendarPostTitle(post.caption)
  const time = post.scheduled_for ? formatCalendarPostTime(post.scheduled_for, timeZone) : ''
  const day = post.scheduled_for
    ? new Intl.DateTimeFormat('en-AU', {
        timeZone: resolveBusinessTimeZone(timeZone),
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(post.scheduled_for))
    : ''
  return `${mode} ${platforms} post "${title}" scheduled ${day} at ${time}`
}

export function formatCalendarDetailHeading(iso: string, timeZone: string): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const datePart = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
  const timePart = formatCalendarPostTime(iso, tz)
  return `${datePart} · ${timePart}`
}

export function postsScheduledInWeek<T extends CalendarPostLike>(
  posts: T[],
  weekDays: string[],
  timeZone: string,
): T[] {
  const tz = resolveBusinessTimeZone(timeZone)
  const daySet = new Set(weekDays)
  return posts.filter((p) => {
    if (!p.scheduled_for) return false
    return daySet.has(scheduledDateKey(p.scheduled_for, tz))
  })
}

export function groupPostsForMobileAgenda<T extends CalendarPostLike>(
  posts: T[],
  weekDays: string[],
  timeZone: string,
): { dayKey: string; posts: T[] }[] {
  const tz = resolveBusinessTimeZone(timeZone)
  const byDay = new Map<string, T[]>()
  for (const day of weekDays) byDay.set(day, [])

  for (const post of posts) {
    if (!post.scheduled_for) continue
    const dayKey = scheduledDateKey(post.scheduled_for, tz)
    if (!byDay.has(dayKey)) continue
    byDay.get(dayKey)!.push(post)
  }

  return weekDays.map((dayKey) => ({
    dayKey,
    posts: (byDay.get(dayKey) ?? []).sort(
      (a, b) =>
        new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime(),
    ),
  }))
}
