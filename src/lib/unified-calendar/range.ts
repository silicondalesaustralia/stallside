import { localDateTimeToUtc } from '@/lib/utils/australiaSydneyTime'
import {
  addDaysToDateKey,
  mondayOfWeekContaining,
  weekDateRange,
} from '@/lib/social/weekPlan/weekIdentity'
import {
  buildMonthWeekRows,
  formatCalendarMonthHeading,
  shiftCalendarMonth,
} from '@/lib/tradiespost/calendarMonthView'
import { formatCalendarWeekHeading, shiftCalendarWeek } from '@/lib/social/socialCalendar'
import type { UnifiedView } from './types'

export function monthAnchorOf(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`
}

/** Every day key the grid renders (month view includes leading/trailing days). */
export function visibleDayKeys(view: UnifiedView, dateKey: string, timeZone: string): string[] {
  if (view === 'month') return buildMonthWeekRows(monthAnchorOf(dateKey), timeZone).flat()
  return weekDateRange(mondayOfWeekContaining(dateKey, timeZone), timeZone)
}

export function visibleRange(
  view: UnifiedView,
  dateKey: string,
  timeZone: string,
): { start: Date; end: Date } {
  const days = visibleDayKeys(view, dateKey, timeZone)
  const lastDay = days[days.length - 1]
  return {
    start: localDateTimeToUtc(days[0], '00:00', timeZone),
    end: localDateTimeToUtc(addDaysToDateKey(lastDay, 1, timeZone), '00:00', timeZone),
  }
}

export function shiftAnchor(
  view: UnifiedView,
  dateKey: string,
  delta: number,
  timeZone: string,
): string {
  if (view === 'month') return shiftCalendarMonth(monthAnchorOf(dateKey), delta, timeZone)
  return shiftCalendarWeek(mondayOfWeekContaining(dateKey, timeZone), delta, timeZone)
}

export function calendarHeading(view: UnifiedView, dateKey: string, timeZone: string): string {
  if (view === 'month') return formatCalendarMonthHeading(monthAnchorOf(dateKey), timeZone)
  return formatCalendarWeekHeading(mondayOfWeekContaining(dateKey, timeZone), timeZone)
}

export function isDateKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}
