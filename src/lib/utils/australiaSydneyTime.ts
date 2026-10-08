/** Default IANA timezone for Australian tradies. */
export const AUSTRALIA_SYDNEY = 'Australia/Sydney'

export const AUSTRALIAN_TIMEZONE_OPTIONS = [
  { value: 'Australia/Sydney',    label: 'Sydney / Melbourne (AEST/AEDT)' },
  { value: 'Australia/Brisbane',  label: 'Brisbane (AEST - no daylight saving)' },
  { value: 'Australia/Adelaide',  label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Perth',     label: 'Perth (AWST)' },
  { value: 'Australia/Darwin',    label: 'Darwin (ACST)' },
  { value: 'Australia/Hobart',    label: 'Hobart (AEST/AEDT)' },
  { value: 'Australia/Lord_Howe', label: 'Lord Howe Island' },
] as const

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year:   'numeric',
      month:  '2-digit',
      day:    '2-digit',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    partsFormatterCache.set(timeZone, formatter)
  }
  return formatter
}

export interface ZonedDateTimeParts {
  year:   number
  month:  number
  day:    number
  hour:   number
  minute: number
}

function localMs(y: number, mo: number, d: number, h: number, mi: number): number {
  return Date.UTC(y, mo - 1, d, h, mi, 0, 0)
}

/** Wall-clock parts for an instant in the given IANA timezone. */
export function getZonedParts(ms: number, timeZone: string): ZonedDateTimeParts {
  const map = Object.fromEntries(
    getPartsFormatter(timeZone).formatToParts(new Date(ms))
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  )
  return {
    year:   Number(map.year),
    month:  Number(map.month),
    day:    Number(map.day),
    hour:   Number(map.hour),
    minute: Number(map.minute),
  }
}

/**
 * Converts a wall-clock date + time in an IANA timezone to a UTC Date.
 * Handles DST transitions via iterative offset correction.
 */
export function localDateTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)

  const targetLocalMs = localMs(year, month, day, hour, minute)

  let utcMs = targetLocalMs - 10 * 60 * 60 * 1000
  for (let i = 0; i < 4; i++) {
    const parts = getZonedParts(utcMs, timeZone)
    const actualLocalMs = localMs(parts.year, parts.month, parts.day, parts.hour, parts.minute)
    const diff = targetLocalMs - actualLocalMs
    if (diff === 0) break
    utcMs += diff
  }

  return new Date(utcMs)
}

/** @deprecated Prefer localDateTimeToUtc with explicit timezone. */
export function sydneyLocalDateTimeToUtc(date: string, time: string): Date {
  return localDateTimeToUtc(date, time, AUSTRALIA_SYDNEY)
}

/** YYYY-MM-DD calendar date for an instant in the given timezone. */
export function dateKeyInTimeZone(isoOrDate: string | Date, timeZone: string): string {
  const ms = new Date(isoOrDate).getTime()
  const parts = getZonedParts(ms, timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

/** Hour and minute in the given timezone (for calendar grid positioning). */
export function getZonedHourMinute(isoOrDate: string | Date, timeZone: string): { hour: number; minute: number } {
  const parts = getZonedParts(new Date(isoOrDate).getTime(), timeZone)
  return { hour: parts.hour, minute: parts.minute }
}

/** en-AU time label, e.g. "8:00 am". */
export function formatZonedTime(isoOrDate: string | Date, timeZone: string): string {
  return new Date(isoOrDate).toLocaleTimeString('en-AU', {
    hour:     'numeric',
    minute:   '2-digit',
    hour12:   true,
    timeZone,
  })
}
