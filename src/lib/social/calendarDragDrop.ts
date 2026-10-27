import { getZonedHourMinute, localDateTimeToUtc } from '@/lib/utils/australiaSydneyTime'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'

export const CALENDAR_POST_DRAG_MIME = 'application/x-social-post-id'

export function calendarDropKey(dayKey: string, hour?: number): string {
  return hour === undefined ? dayKey : `${dayKey}T${hour}`
}

/**
 * New UTC ISO for a post dropped on `dayKey` (and optionally `hour`) in business time.
 * Keeps the original minutes, and the original hour when `hour` is omitted (month view).
 */
export function calendarDropTargetIso(
  scheduledFor: string,
  dayKey: string,
  hour: number | undefined,
  timeZone: string,
): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const original = getZonedHourMinute(scheduledFor, tz)
  const h = hour ?? original.hour
  const time = `${String(h).padStart(2, '0')}:${String(original.minute).padStart(2, '0')}`
  return localDateTimeToUtc(dayKey, time, tz).toISOString()
}

export function sameInstant(a: string, b: string): boolean {
  return new Date(a).getTime() === new Date(b).getTime()
}
