import type { SupabaseClient } from '@supabase/supabase-js'
import { mondayOfCurrentWeek, nextWeekMondayDateKey } from '@/lib/social/weekPlan/weekIdentity'
import { serializeItemRow, serializePlanRow } from '@/lib/social/weekPlan/weekPlanService'
import { countVariantPreviews } from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'

export type WeekPlanListEntry = {
  plan: WeekPlanRow
  itemCount: number
  previewCount: number
  items: WeekPlanItemRow[]
}

export type WeekPlanHistoryResult = {
  timeZone: string
  nextWeekStartDate: string
  currentWeekStartDate: string
  upcoming: WeekPlanListEntry[]
  past: WeekPlanListEntry[]
}

export async function listWeekPlanHistory(
  db: SupabaseClient,
  businessId: string,
  timeZone: string,
): Promise<WeekPlanHistoryResult> {
  const currentWeekStartDate = mondayOfCurrentWeek(timeZone)
  const nextWeekStartDate = nextWeekMondayDateKey(timeZone)

  const { data: plans, error } = await db
    .from('social_week_plans')
    .select('*')
    .eq('business_id', businessId)
    .order('week_start_date', { ascending: false })

  if (error) throw new Error(error.message)

  const serializedPlans = (plans ?? []).map((row) => serializePlanRow(row))
  const planIds = serializedPlans.map((plan) => plan.id)

  const itemsByPlanId = new Map<string, WeekPlanItemRow[]>()
  for (const planId of planIds) {
    itemsByPlanId.set(planId, [])
  }

  if (planIds.length > 0) {
    const { data: itemsRaw, error: itemsErr } = await db
      .from('social_week_plan_items')
      .select('*')
      .eq('business_id', businessId)
      .in('plan_id', planIds)
      .order('sort_order', { ascending: true })

    if (itemsErr) throw new Error(itemsErr.message)

    for (const row of itemsRaw ?? []) {
      const item = serializeItemRow(row)
      itemsByPlanId.get(item.plan_id)?.push(item)
    }
  }

  const entries: WeekPlanListEntry[] = serializedPlans.map((plan) => {
    const items = itemsByPlanId.get(plan.id) ?? []
    return {
      plan,
      itemCount: items.length,
      previewCount: countVariantPreviews(items),
      items,
    }
  })

  const upcoming = entries
    .filter(
      (e) =>
        e.plan.status !== 'archived' &&
        e.plan.week_start_date >= currentWeekStartDate,
    )
    .sort((a, b) => a.plan.week_start_date.localeCompare(b.plan.week_start_date))

  const past = entries
    .filter(
      (e) =>
        e.plan.status === 'archived' ||
        e.plan.week_start_date < currentWeekStartDate,
    )
    .sort((a, b) => b.plan.week_start_date.localeCompare(a.plan.week_start_date))

  return {
    timeZone,
    nextWeekStartDate,
    currentWeekStartDate,
    upcoming,
    past,
  }
}
