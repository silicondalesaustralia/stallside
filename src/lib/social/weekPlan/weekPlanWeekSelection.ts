import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import {
  addDaysToDateKey,
  mondayOfCurrentWeek,
  mondayOfWeekContaining,
  nextWeekMondayDateKey,
  resolveBusinessTimeZone,
} from '@/lib/social/weekPlan/weekIdentity'

export type ActiveWeekPlanSummary = {
  weekStartDate: string
  planId: string
  status: 'draft' | 'plan_approved' | 'archived'
  generationStatus?: string | null
}

export function normalizeWeekStartMonday(dateKey: string, timeZone: string): string {
  return mondayOfWeekContaining(dateKey.trim(), resolveBusinessTimeZone(timeZone))
}

export function occupiedActiveWeekStarts(plans: ActiveWeekPlanSummary[]): string[] {
  return plans.filter((p) => p.status !== 'archived').map((p) => p.weekStartDate)
}

/** First Monday-based week (from current week forward) without an active plan. */
export function findNextAvailableWeek(
  occupiedWeekStarts: string[],
  timeZone: string,
  nowMs = Date.now(),
  searchWeeks = 52,
): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const occupied = new Set(occupiedWeekStarts)
  const startMonday = mondayOfCurrentWeek(tz, nowMs)

  for (let i = 0; i < searchWeeks; i++) {
    const candidate = addDaysToDateKey(startMonday, i * 7, tz)
    if (!occupied.has(candidate)) return candidate
  }

  return nextWeekMondayDateKey(tz, nowMs)
}

export function defaultBuildWeekStart(
  occupiedWeekStarts: string[],
  timeZone: string,
  nowMs = Date.now(),
): string {
  return findNextAvailableWeek(occupiedWeekStarts, timeZone, nowMs)
}

export function weekSelectionPreset(
  weekStartMonday: string,
  timeZone: string,
  nowMs = Date.now(),
): 'this_week' | 'next_week' | 'custom' {
  const tz = resolveBusinessTimeZone(timeZone)
  const current = mondayOfCurrentWeek(tz, nowMs)
  const next = nextWeekMondayDateKey(tz, nowMs)
  if (weekStartMonday === current) return 'this_week'
  if (weekStartMonday === next) return 'next_week'
  return 'custom'
}

export function suggestWeekAfter(
  afterWeekStartMonday: string,
  occupiedWeekStarts: string[],
  timeZone: string,
): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const occupied = new Set(occupiedWeekStarts)
  let candidate = addDaysToDateKey(afterWeekStartMonday, 7, tz)

  for (let i = 0; i < 52; i++) {
    if (!occupied.has(candidate)) return candidate
    candidate = addDaysToDateKey(candidate, 7, tz)
  }

  return candidate
}

export type WeekCollisionState =
  | { kind: 'empty' }
  | { kind: 'draft'; planId: string }
  | { kind: 'approved'; planId: string; generationStatus: string }

export function resolveWeekCollision(
  weekStartMonday: string,
  plans: ActiveWeekPlanSummary[],
): WeekCollisionState {
  const plan = plans.find(
    (p) => p.weekStartDate === weekStartMonday && p.status !== 'archived',
  )
  if (!plan) return { kind: 'empty' }
  if (plan.status === 'plan_approved') {
    return {
      kind: 'approved',
      planId: plan.planId,
      generationStatus: plan.generationStatus ?? 'not_started',
    }
  }
  return { kind: 'draft', planId: plan.planId }
}

/** Monday date keys for upcoming N weeks from current week (inclusive). */
export function upcomingWeekMondayOptions(
  timeZone: string,
  count = 8,
  nowMs = Date.now(),
): string[] {
  const tz = resolveBusinessTimeZone(timeZone)
  const start = mondayOfCurrentWeek(tz, nowMs)
  return Array.from({ length: count }, (_, i) => addDaysToDateKey(start, i * 7, tz))
}

export function datePickerValueForWeekStart(weekStartMonday: string, timeZone: string): string {
  return weekStartMonday
}

export function weekStartFromDatePickerValue(value: string, timeZone: string): string {
  if (!value.trim()) return mondayOfCurrentWeek(resolveBusinessTimeZone(timeZone))
  return normalizeWeekStartMonday(value, timeZone)
}

export function isMondayDateKey(dateKey: string, timeZone: string): boolean {
  const tz = resolveBusinessTimeZone(timeZone)
  return mondayOfWeekContaining(dateKey, tz) === dateKey
}

export function formatWeekPickerHint(dateKey: string, timeZone: string): string {
  const tz = resolveBusinessTimeZone(timeZone)
  const monday = normalizeWeekStartMonday(dateKey, tz)
  const sunday = addDaysToDateKey(monday, 6, tz)
  const mondayLabel = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(localMs(monday, tz)))
  const sundayLabel = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(localMs(sunday, tz)))
  return `${mondayLabel} → ${sundayLabel}`
}

function localMs(dateKey: string, timeZone: string): number {
  return new Date(`${dateKey}T12:00:00`).getTime()
}

export function todayDateKey(timeZone: string, nowMs = Date.now()): string {
  return dateKeyInTimeZone(new Date(nowMs), resolveBusinessTimeZone(timeZone))
}

export type WeekSelectMode = 'this_week' | 'next_week' | 'custom'

/** Initial wizard highlight: preset weeks only - custom default does not auto-open the picker. */
export function initialWeekSelectMode(
  weekStartMonday: string,
  timeZone: string,
  nowMs = Date.now(),
): WeekSelectMode | null {
  const preset = weekSelectionPreset(weekStartMonday, timeZone, nowMs)
  if (preset === 'this_week' || preset === 'next_week') return preset
  return null
}

export function isWeekSelectStepReady(input: {
  mode: WeekSelectMode | null
  pickerDate: string
  collisionKind: WeekCollisionState['kind']
}): boolean {
  if (input.collisionKind !== 'empty') return false
  if (input.mode === 'this_week' || input.mode === 'next_week') return true
  if (input.mode === 'custom') return Boolean(input.pickerDate.trim())
  return false
}
