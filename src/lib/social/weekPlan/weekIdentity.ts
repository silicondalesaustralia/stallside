import { AUSTRALIA_SYDNEY, dateKeyInTimeZone, localDateTimeToUtc } from '@/lib/utils/australiaSydneyTime'

const WEEKDAY_TO_DAYS_FROM_MONDAY: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

/** YYYY-MM-DD calendar date, noon wall-clock in timezone - stable for +/- day math. */
export function addDaysToDateKey(dateKey: string, days: number, timeZone: string): string {
  const ms = localDateTimeToUtc(dateKey, '12:00', timeZone).getTime()
  return dateKeyInTimeZone(new Date(ms + days * 24 * 60 * 60 * 1000), timeZone)
}

export function weekdayNameInTimeZone(dateKey: string, timeZone: string): string {
  const ms = localDateTimeToUtc(dateKey, '12:00', timeZone).getTime()
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(new Date(ms))
}

/** Monday (YYYY-MM-DD) of the week containing dateKey in the given IANA timezone. */
export function mondayOfWeekContaining(dateKey: string, timeZone: string): string {
  const weekday = weekdayNameInTimeZone(dateKey, timeZone)
  const daysFromMonday = WEEKDAY_TO_DAYS_FROM_MONDAY[weekday] ?? 0
  return addDaysToDateKey(dateKey, -daysFromMonday, timeZone)
}

/**
 * Default wizard target: Monday of next calendar week (business-local).
 * e.g. Friday → upcoming Monday; Monday → following Monday.
 */
export function nextWeekMondayDateKey(timeZone: string, nowMs = Date.now()): string {
  const today = dateKeyInTimeZone(new Date(nowMs), timeZone)
  const thisMonday = mondayOfWeekContaining(today, timeZone)
  return addDaysToDateKey(thisMonday, 7, timeZone)
}

/** All seven dates Mon-Sun for a week starting weekStartMonday (YYYY-MM-DD). */
export function weekDateRange(weekStartMonday: string, timeZone: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToDateKey(weekStartMonday, i, timeZone))
}

export function isDateInWeek(dateKey: string, weekStartMonday: string, timeZone: string): boolean {
  const range = weekDateRange(weekStartMonday, timeZone)
  return range.includes(dateKey)
}

export function formatWeekPlanDayLabel(dateKey: string, timeZone: string): string {
  const ms = localDateTimeToUtc(dateKey, '12:00', timeZone).getTime()
  return new Intl.DateTimeFormat('en-AU', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(ms))
}

export function resolveBusinessTimeZone(raw: string | null | undefined): string {
  const trimmed = raw?.trim()
  if (trimmed) return trimmed
  return AUSTRALIA_SYDNEY
}

/** Sunday (YYYY-MM-DD) for a week starting on weekStartMonday. */
export function weekEndSunday(weekStartMonday: string, timeZone: string): string {
  return addDaysToDateKey(weekStartMonday, 6, timeZone)
}

function formatDayMonth(
  dateKey: string,
  timeZone: string,
  opts: { month?: 'short' | 'long'; year?: boolean },
): string {
  const ms = localDateTimeToUtc(dateKey, '12:00', timeZone).getTime()
  const formatted = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    day: 'numeric',
    month: opts.month ?? 'short',
    ...(opts.year ? { year: 'numeric' } : {}),
  }).format(new Date(ms))
  return opts.month === 'short' ? formatted.replace(/\bSept\b/, 'Sep') : formatted
}

/** Compact card label: "7-13 Sep" */
export function formatWeekRangeCompact(weekStartMonday: string, timeZone: string): string {
  const end = weekEndSunday(weekStartMonday, timeZone)
  const startFormatted = formatDayMonth(weekStartMonday, timeZone, { month: 'short' })
  const endFormatted = formatDayMonth(end, timeZone, { month: 'short' })
  const [startNum, startMonth] = startFormatted.split(' ')
  const [endNum, endMonth] = endFormatted.split(' ')
  if (startMonth === endMonth) {
    return `${startNum}-${endNum} ${endMonth}`
  }
  return `${startNum} ${startMonth} - ${endNum} ${endMonth}`
}

/** Heading label: "7-13 September 2026" */
export function formatWeekRangeHeading(weekStartMonday: string, timeZone: string): string {
  const end = weekEndSunday(weekStartMonday, timeZone)
  const startDay = formatDayMonth(weekStartMonday, timeZone, { month: 'long' })
  const endFull = formatDayMonth(end, timeZone, { month: 'long', year: true })
  const startNum = startDay.split(' ')[0]
  const endNum = endFull.split(' ')[0]
  const endMonth = endFull.split(' ')[1]
  const endYear = endFull.split(' ')[2]
  return `${startNum}-${endNum} ${endMonth} ${endYear}`
}

/** "Next week · 7-13 September" when applicable, else date range heading. */
export function formatWeekRangeWithContext(
  weekStartMonday: string,
  timeZone: string,
  nowMs = Date.now(),
): string {
  const nextMonday = nextWeekMondayDateKey(timeZone, nowMs)
  const heading = formatWeekRangeHeading(weekStartMonday, timeZone)
  if (weekStartMonday === nextMonday) {
    return `Next week · ${heading.replace(/ \d{4}$/, '')}`
  }
  return heading
}

export function mondayOfCurrentWeek(timeZone: string, nowMs = Date.now()): string {
  const today = dateKeyInTimeZone(new Date(nowMs), timeZone)
  return mondayOfWeekContaining(today, timeZone)
}
