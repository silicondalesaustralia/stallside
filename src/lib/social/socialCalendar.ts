import { dateKeyInTimeZone, formatZonedTime } from '@/lib/utils/australiaSydneyTime'
import {
  addDaysToDateKey,
  formatWeekRangeHeading,
  mondayOfWeekContaining,
  weekDateRange,
} from '@/lib/social/weekPlan/weekIdentity'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'

export type CalendarPostLike = {
  id: string
  status: string
  publishing_mode?: string | null
  scheduled_for: string | null
  caption: string | null
  platforms: string[]
  photo_urls: string[]
  week_plan_item_id?: string | null
}

/** Upcoming Calendar entries - canonical social_posts filter. */
export function filterUpcomingCalendarPosts<T extends CalendarPostLike>(posts: T[]): T[] {
  return posts.filter((p) => p.status === 'scheduled' && Boolean(p.scheduled_for))
}

export function filterCalendarPostsByMode<T extends CalendarPostLike>(
  posts: T[],
  filter: 'all' | 'automatic' | 'manual',
): T[] {
  if (filter === 'all') return posts
  return posts.filter((p) => p.publishing_mode === filter)
}

export function scheduledDateKey(iso: string, timeZone: string): string {
  return dateKeyInTimeZone(iso, resolveBusinessTimeZone(timeZone))
}

export function groupPostsByScheduledDate<T extends CalendarPostLike>(
  posts: T[],
  timeZone: string,
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}
  for (const post of posts) {
    if (!post.scheduled_for) continue
    const day = scheduledDateKey(post.scheduled_for, timeZone)
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(post)
  }
  for (const day of Object.keys(grouped)) {
    grouped[day].sort(
      (a, b) =>
        new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime(),
    )
  }
  return grouped
}

export function weekContainsScheduledPosts<T extends CalendarPostLike>(
  posts: T[],
  weekStartMonday: string,
  timeZone: string,
): boolean {
  const range = weekDateRange(weekStartMonday, timeZone)
  const grouped = groupPostsByScheduledDate(posts, timeZone)
  return range.some((day) => (grouped[day]?.length ?? 0) > 0)
}

export function defaultCalendarWeekStart(timeZone: string, now = new Date()): string {
  const today = dateKeyInTimeZone(now, resolveBusinessTimeZone(timeZone))
  return mondayOfWeekContaining(today, resolveBusinessTimeZone(timeZone))
}

export function shiftCalendarWeek(weekStartMonday: string, deltaWeeks: number, timeZone: string): string {
  const tz = resolveBusinessTimeZone(timeZone)
  return addDaysToDateKey(weekStartMonday, deltaWeeks * 7, tz)
}

export function formatCalendarWeekHeading(weekStartMonday: string, timeZone: string): string {
  return formatWeekRangeHeading(weekStartMonday, resolveBusinessTimeZone(timeZone))
}

export function formatCalendarDayHeading(dateKey: string, timeZone: string): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const ms = new Date(`${dateKey}T12:00:00`).getTime()
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(ms))
}

export function formatCalendarPostTime(iso: string, timeZone: string): string {
  return formatZonedTime(iso, resolveBusinessTimeZone(timeZone))
}

export function calendarPostTitle(caption: string | null): string {
  const trimmed = caption?.trim()
  if (!trimmed) return 'Scheduled post'
  const firstLine = trimmed.split('\n')[0]?.trim() ?? trimmed
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine
}

export function postingModeLabel(mode?: string | null): 'Manual' | 'Automatic' {
  return mode === 'manual' ? 'Manual' : 'Automatic'
}
