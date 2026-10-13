import {
  dateKeyInTimeZone,
  formatZonedTime,
  getZonedHourMinute,
  localDateTimeToUtc,
} from '@/lib/utils/australiaSydneyTime'
import type { UnifiedItem, UnifiedMoveTimes, UnifiedSlot } from './types'

const DEFAULT_START_HOUR = 7
const DEFAULT_END_HOUR_EXCLUSIVE = 22

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function itemDayKey(item: UnifiedItem, timeZone: string): string {
  return dateKeyInTimeZone(item.startsAt, timeZone)
}

export function itemStartHour(item: UnifiedItem, timeZone: string): number {
  return getZonedHourMinute(item.startsAt, timeZone).hour
}

export function groupItemsByDay(
  items: UnifiedItem[],
  dayKeys: string[],
  timeZone: string,
): Map<string, UnifiedItem[]> {
  const byDay = new Map<string, UnifiedItem[]>(dayKeys.map((d) => [d, []]))
  for (const item of items) {
    byDay.get(itemDayKey(item, timeZone))?.push(item)
  }
  return byDay
}

/** 7am–9pm by default, stretched to fit any timed item in the week. */
export function weekHours(items: UnifiedItem[], timeZone: string): number[] {
  let start = DEFAULT_START_HOUR
  let end = DEFAULT_END_HOUR_EXCLUSIVE
  for (const item of items) {
    if (item.allDay) continue
    const hour = itemStartHour(item, timeZone)
    start = Math.min(start, hour)
    end = Math.max(end, hour + 1)
  }
  return Array.from({ length: end - start }, (_, i) => start + i)
}

export function formatItemTime(item: UnifiedItem, timeZone: string): string {
  if (item.allDay) return 'All day'
  const start = formatZonedTime(item.startsAt, timeZone)
  return item.endsAt ? `${start}–${formatZonedTime(item.endsAt, timeZone)}` : start
}

export function formatHourLabel(hour: number): string {
  return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`
}

/** New start/end for a drop: keeps the time of day (or minute) and the duration. */
export function movedTimes(item: UnifiedItem, slot: UnifiedSlot, timeZone: string): UnifiedMoveTimes {
  const { hour, minute } = getZonedHourMinute(item.startsAt, timeZone)
  const time = item.allDay ? '00:00' : `${pad(slot.hour ?? hour)}:${pad(minute)}`
  return timesAt(item, slot.dayKey, time, timeZone)
}

export function timesAt(
  item: UnifiedItem,
  dayKey: string,
  time: string,
  timeZone: string,
): UnifiedMoveTimes {
  const start = localDateTimeToUtc(dayKey, time, timeZone)
  const delta = start.getTime() - Date.parse(item.startsAt)
  return {
    startsAt: start.toISOString(),
    endsAt: item.endsAt ? new Date(Date.parse(item.endsAt) + delta).toISOString() : null,
  }
}

export function itemLocalTime(item: UnifiedItem, timeZone: string): string {
  const { hour, minute } = getZonedHourMinute(item.startsAt, timeZone)
  return `${pad(hour)}:${pad(minute)}`
}
