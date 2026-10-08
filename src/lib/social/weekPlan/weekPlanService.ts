import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  WeekPlanItemRow,
  WeekPlanPlatform,
  WeekPlanRow,
  WeekPlanStatus,
  WeekPlanWizardAnswers,
} from '@/lib/social/weekPlan/types'
import type { ValidatedPlanItem } from '@/lib/social/weekPlan/plannerValidation'

export function parseWizardAnswers(raw: unknown): WeekPlanWizardAnswers {
  const row = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {}

  const postCount =
    typeof row.postCount === 'number' && row.postCount >= 1 && row.postCount <= 7
      ? row.postCount
      : 4

  const contentMix = Array.isArray(row.contentMix)
    ? row.contentMix.filter((v): v is WeekPlanWizardAnswers['contentMix'][number] =>
        typeof v === 'string',
      )
    : []

  const platforms = Array.isArray(row.platforms)
    ? row.platforms.filter((v): v is WeekPlanPlatform =>
        v === 'facebook' || v === 'instagram' || v === 'gmb',
      )
    : []

  const selectedJobIds = Array.isArray(row.selectedJobIds)
    ? row.selectedJobIds.filter((v): v is string => typeof v === 'string')
    : []

  return {
    postCount,
    contentMix,
    chooseForMe: row.chooseForMe === true,
    priorityText:
      typeof row.priorityText === 'string' && row.priorityText.trim()
        ? row.priorityText.trim()
        : null,
    selectedJobIds,
    platforms,
  }
}

export function serializePlanRow(row: Record<string, unknown>): WeekPlanRow {
  return {
    ...(row as WeekPlanRow),
    wizard_answers: parseWizardAnswers(row.wizard_answers),
    generation_status:
      typeof row.generation_status === 'string'
        ? (row.generation_status as WeekPlanRow['generation_status'])
        : 'not_started',
  }
}

function parseVariantPreviews(raw: unknown): WeekPlanItemRow['variant_previews'] {
  if (!Array.isArray(raw)) return null
  return raw.filter(
    (v): v is WeekPlanItemRow['variant_previews'] extends (infer U)[] | null ? U : never =>
      v &&
      typeof v === 'object' &&
      typeof (v as { id?: unknown }).id === 'string' &&
      typeof (v as { imageUrl?: unknown }).imageUrl === 'string' &&
      typeof (v as { storagePath?: unknown }).storagePath === 'string',
  )
}

function parseReviewStatus(raw: unknown): WeekPlanItemRow['review_status'] {
  if (
    raw === 'needs_selection' ||
    raw === 'selected' ||
    raw === 'approved' ||
    raw === 'scheduled' ||
    raw === 'skipped'
  ) {
    return raw
  }
  return 'needs_selection'
}

export function serializeItemRow(row: Record<string, unknown>): WeekPlanItemRow {
  const platforms = Array.isArray(row.platforms)
    ? row.platforms.filter((v): v is WeekPlanPlatform =>
        v === 'facebook' || v === 'instagram' || v === 'gmb',
      )
    : []
  return {
    ...(row as WeekPlanItemRow),
    platforms,
    generation_status:
      typeof row.generation_status === 'string'
        ? (row.generation_status as WeekPlanItemRow['generation_status'])
        : 'not_started',
    generation_id: typeof row.generation_id === 'string' ? row.generation_id : null,
    generation_error: typeof row.generation_error === 'string' ? row.generation_error : null,
    variant_previews: parseVariantPreviews(row.variant_previews),
    variant_previews_previous: parseVariantPreviews(row.variant_previews_previous),
    selected_variant_id:
      typeof row.selected_variant_id === 'string' ? row.selected_variant_id : null,
    review_status: parseReviewStatus(row.review_status),
    hybrid_render_id: typeof row.hybrid_render_id === 'string' ? row.hybrid_render_id : null,
    scheduled_social_post_id:
      typeof row.scheduled_social_post_id === 'string' ? row.scheduled_social_post_id : null,
    approved_at: typeof row.approved_at === 'string' ? row.approved_at : null,
    skipped_at: typeof row.skipped_at === 'string' ? row.skipped_at : null,
    generation_started_at:
      typeof row.generation_started_at === 'string' ? row.generation_started_at : null,
    generation_completed_at:
      typeof row.generation_completed_at === 'string' ? row.generation_completed_at : null,
  }
}

export async function loadActiveWeekPlan(
  db: SupabaseClient,
  businessId: string,
  weekStartDate: string,
): Promise<{ plan: WeekPlanRow; items: WeekPlanItemRow[] } | null> {
  const { data: plan, error } = await db
    .from('social_week_plans')
    .select('*')
    .eq('business_id', businessId)
    .eq('week_start_date', weekStartDate)
    .neq('status', 'archived')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!plan) return null

  const { data: items, error: itemsErr } = await db
    .from('social_week_plan_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order', { ascending: true })

  if (itemsErr) throw new Error(itemsErr.message)

  return {
    plan: serializePlanRow(plan),
    items: (items ?? []).map(serializeItemRow),
  }
}

export async function replacePlanItems(
  db: SupabaseClient,
  params: {
    planId: string
    businessId: string
    items: ValidatedPlanItem[]
    platforms: WeekPlanPlatform[]
  },
): Promise<WeekPlanItemRow[]> {
  const { error: delErr } = await db
    .from('social_week_plan_items')
    .delete()
    .eq('plan_id', params.planId)
    .eq('business_id', params.businessId)

  if (delErr) throw new Error(delErr.message)

  if (params.items.length === 0) return []

  const rows = params.items.map((item, index) => ({
    plan_id: params.planId,
    business_id: params.businessId,
    sort_order: index,
    target_date: item.targetDate,
    post_type: item.postType,
    subtype_id: item.subtypeId,
    intent_chip: item.intentChip,
    topic: item.topic,
    user_brief: item.userBrief,
    job_id: item.jobId,
    platforms: params.platforms,
    status: 'planned',
  }))

  const { data, error } = await db
    .from('social_week_plan_items')
    .insert(rows)
    .select('*')

  if (error) throw new Error(error.message)
  return (data ?? []).map(serializeItemRow)
}

export async function upsertDraftWeekPlan(
  db: SupabaseClient,
  params: {
    businessId: string
    userId: string
    weekStartDate: string
    postCountTarget: number
    wizardAnswers: WeekPlanWizardAnswers
  },
): Promise<WeekPlanRow> {
  const existing = await loadActiveWeekPlan(db, params.businessId, params.weekStartDate)

  if (existing?.plan.status === 'plan_approved') {
    throw new Error('Plan is already approved - reopen to edit')
  }

  if (existing) {
    const { data, error } = await db
      .from('social_week_plans')
      .update({
        post_count_target: params.postCountTarget,
        wizard_answers: params.wizardAnswers,
        status: 'draft',
        approved_at: null,
        approved_by_user_id: null,
      })
      .eq('id', existing.plan.id)
      .eq('business_id', params.businessId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return serializePlanRow(data)
  }

  const { data, error } = await db
    .from('social_week_plans')
    .insert({
      business_id: params.businessId,
      week_start_date: params.weekStartDate,
      status: 'draft',
      post_count_target: params.postCountTarget,
      wizard_answers: params.wizardAnswers,
      created_by_user_id: params.userId,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializePlanRow(data)
}

export async function loadPlanForBusiness(
  db: SupabaseClient,
  businessId: string,
  planId: string,
): Promise<{ plan: WeekPlanRow; items: WeekPlanItemRow[] } | null> {
  const { data: plan, error } = await db
    .from('social_week_plans')
    .select('*')
    .eq('id', planId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!plan) return null

  const { data: items, error: itemsErr } = await db
    .from('social_week_plan_items')
    .select('*')
    .eq('plan_id', planId)
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  if (itemsErr) throw new Error(itemsErr.message)

  return {
    plan: serializePlanRow(plan),
    items: (items ?? []).map(serializeItemRow),
  }
}

export function assertPlanEditable(plan: WeekPlanRow): void {
  if (plan.generation_status !== 'not_started') {
    throw new Error('Plan structure is locked during or after generation')
  }
  if (plan.status === 'plan_approved') {
    throw new Error('Plan is approved - use Edit Plan to make changes')
  }
  if (plan.status === 'archived') {
    throw new Error('Plan is archived')
  }
}

export function assertPlanStructureEditable(plan: WeekPlanRow): void {
  if (plan.generation_status !== 'not_started') {
    throw new Error('Plan structure is locked during or after generation')
  }
}

export async function updatePlanStatus(
  db: SupabaseClient,
  planId: string,
  businessId: string,
  status: WeekPlanStatus,
  extra?: Record<string, unknown>,
): Promise<WeekPlanRow> {
  const { data, error } = await db
    .from('social_week_plans')
    .update({ status, ...extra })
    .eq('id', planId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializePlanRow(data)
}
