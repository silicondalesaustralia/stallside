import type { SupabaseClient } from '@supabase/supabase-js'
import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'
import {
  finalizeWeekPlanItemToLibrary,
  isItemProductionLocked,
  itemHasValidSelection,
  selectedVariantForItem,
} from '@/lib/social/weekPlan/finalizeWeekPlanItem'
import { findStoredVariant } from '@/lib/social/weekPlan/weekPlanVariantStorage'
import { generateDesignedCaption } from '@/lib/social/generateDesignedCaption'
import { parseAiDesignedIntentChip } from '@/lib/social/designedIntents'
import {
  consumeRenderUsage,
  evaluateUsageAccess,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import {
  parseDesignedGenerationId,
  shouldRefundDesignedGeneration,
} from '@/lib/social/designedCredits'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import { runDesignedVariants } from '@/lib/social/runDesignedVariants'
import { toStoredVariantPreviews } from '@/lib/social/weekPlan/weekPlanVariantStorage'
import { isRecreateMessageAngle, recreateMessageAngleAt } from '@/lib/social/recreateMessageAngles'
import {
  buildLibrarySocialPostBody,
  socialConnectionsFromBusiness,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { resolveSchedulePublishingMode } from '@/lib/social/socialPostScheduleValidation'
import type { SocialPublishingMode } from '@/lib/social/socialPostTypes'
import { loadPlanForBusiness, serializeItemRow } from '@/lib/social/weekPlan/weekPlanService'
import { isItemEditingLocked } from '@/lib/social/weekPlan/weekPlanPermissions'

export type WeekProductionProgress = {
  total: number
  generated: number
  selected: number
  approved: number
  scheduled: number
  skipped: number
  needsReview: number
}

export function computeWeekProductionProgress(items: WeekPlanItemRow[]): WeekProductionProgress {
  const generated = items.filter((i) => i.generation_status === 'generated')
  return {
    total: items.length,
    generated: generated.length,
    selected: items.filter(
      (i) =>
        i.review_status === 'selected' ||
        i.review_status === 'approved' ||
        i.review_status === 'scheduled',
    ).length,
    approved: items.filter(
      (i) => i.review_status === 'approved' || i.review_status === 'scheduled',
    ).length,
    scheduled: items.filter((i) => i.review_status === 'scheduled').length,
    skipped: items.filter((i) => i.review_status === 'skipped').length,
    needsReview: generated.filter(
      (i) => i.review_status === 'needs_selection' || i.review_status === 'selected',
    ).length,
  }
}

export function isWeekProductionComplete(items: WeekPlanItemRow[]): boolean {
  if (items.length === 0) return false
  return items.every(
    (i) =>
      i.review_status === 'scheduled' ||
      i.review_status === 'skipped' ||
      i.generation_status === 'failed',
  )
}

export async function syncPlanProductionComplete(
  db: SupabaseClient,
  plan: WeekPlanRow,
  items: WeekPlanItemRow[],
): Promise<void> {
  if (!isWeekProductionComplete(items)) return
  const now = new Date().toISOString()
  await db
    .from('social_week_plans')
    .update({ completed_at: plan.completed_at ?? now, updated_at: now })
    .eq('id', plan.id)
    .eq('business_id', plan.business_id)
    .is('completed_at', null)
}

async function loadOwnedItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<{ plan: WeekPlanRow; item: WeekPlanItemRow } | null> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) return null
  const item = loaded.items.find((i) => i.id === itemId)
  if (!item) return null
  return { plan: loaded.plan, item }
}

export async function selectWeekPlanVariant(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  variantId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { item } = loaded
  if (isItemEditingLocked(item)) throw new Error('This post is already scheduled or skipped')
  if (item.generation_status !== 'generated') throw new Error('Post is not ready for selection')

  const variant = findStoredVariant(item.variant_previews, variantId)
  if (!variant) throw new Error('Variant not found on this post')

  const now = new Date().toISOString()
  const clearFinalize =
    item.hybrid_render_id && item.selected_variant_id !== variantId
      ? { hybrid_render_id: null, approved_at: null }
      : {}

  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      selected_variant_id: variantId,
      review_status: 'selected',
      ...clearFinalize,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .eq('plan_id', planId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function updateWeekPlanItemCaption(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  caption: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  if (isItemEditingLocked(loaded.item)) throw new Error('This post is already scheduled or skipped')

  const { data, error } = await db
    .from('social_week_plan_items')
    .update({ caption: caption.trim(), updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function regenerateWeekPlanItemCaption(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { item } = loaded
  if (isItemEditingLocked(item)) throw new Error('This post is already scheduled or skipped')
  if (item.generation_status !== 'generated') throw new Error('Post is not generated yet')

  const variant = selectedVariantForItem(item) ?? item.variant_previews?.[0]
  const userBrief = item.user_brief?.trim() || item.topic.trim()
  const intentChip = parseAiDesignedIntentChip(item.intent_chip)

  const { data: business } = await db
    .from('businesses')
    .select('name, ai_agent_services, suburb, social_brand_voice, social_default_cta, phone, website')
    .eq('id', businessId)
    .maybeSingle()

  let job = null
  if (item.job_id) {
    const { data: jobRow } = await db
      .from('jobs')
      .select('title, notes, site_suburb, site_state')
      .eq('id', item.job_id)
      .eq('business_id', businessId)
      .maybeSingle()
    if (jobRow) {
      job = {
        title: jobRow.title,
        description: jobRow.notes,
        suburb: jobRow.site_suburb,
        state: jobRow.site_state,
      }
    }
  }

  const caption = await generateDesignedCaption({
    businessId,
    designed: {
      userBrief,
      messageAngle: isRecreateMessageAngle(variant?.messageAngle)
        ? variant.messageAngle
        : recreateMessageAngleAt(0),
      intentChip,
      jobId: item.job_id,
      generationMode: 'ai_designed',
      generationSource: 'week_plan',
    },
    business: {
      name: business?.name ?? 'Business',
      services: business?.ai_agent_services ?? null,
      suburb: business?.suburb ?? null,
      brandVoice: business?.social_brand_voice ?? null,
      cta: business?.social_default_cta ?? null,
      phone: business?.phone ?? null,
      website: business?.website ?? null,
    },
    job,
  })

  const { data, error } = await db
    .from('social_week_plan_items')
    .update({ caption, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function approveWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { plan, item } = loaded
  if (isItemEditingLocked(item)) throw new Error('This post is already scheduled or skipped')
  if (!itemHasValidSelection(item)) throw new Error('Select a design before approving')

  if (item.review_status === 'approved' && item.hybrid_render_id) {
    return item
  }

  const variant = selectedVariantForItem(item)!
  const finalized = await finalizeWeekPlanItemToLibrary(db, item, variant)
  if (!finalized.ok) throw new Error(finalized.error)

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      hybrid_render_id: finalized.hybridRenderId,
      review_status: 'approved',
      approved_at: now,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  const updated = serializeItemRow(data)

  const allItems = (await loadPlanForBusiness(db, businessId, planId))!.items.map((i) =>
    i.id === updated.id ? updated : i,
  )
  await syncPlanProductionComplete(db, plan, allItems)

  return updated
}

export async function skipWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  if (loaded.item.review_status === 'scheduled') {
    throw new Error('Cannot skip a scheduled post')
  }

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      review_status: 'skipped',
      skipped_at: now,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  const updated = serializeItemRow(data)
  const allItems = (await loadPlanForBusiness(db, businessId, planId))!.items.map((i) =>
    i.id === updated.id ? updated : i,
  )
  await syncPlanProductionComplete(db, loaded.plan, allItems)
  return updated
}

export async function restorePreviousWeekPlanVariants(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { item } = loaded
  if (isItemEditingLocked(item)) throw new Error('This post is locked')
  if (!item.variant_previews_previous?.length) throw new Error('No previous designs to restore')

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      variant_previews: item.variant_previews_previous,
      variant_previews_previous: null,
      selected_variant_id: null,
      review_status: 'needs_selection',
      hybrid_render_id: null,
      approved_at: null,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function quickChangeWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  adjustment: string,
): Promise<WeekPlanItemRow> {
  if (!isAiDesignedEnabled()) throw new Error('AI Designed is not enabled')
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { item } = loaded
  if (isItemEditingLocked(item)) throw new Error('This post is already scheduled or skipped')
  if (item.generation_status !== 'generated') throw new Error('Post must be generated first')

  const trimmed = adjustment.trim()
  if (!trimmed) throw new Error('Describe what you would like changed')
  if (trimmed.length > 800) throw new Error('Quick change text is too long (max 800 characters)')

  const generationId = parseDesignedGenerationId(crypto.randomUUID())
  let charged = false

  try {
    const access = await evaluateUsageAccess(db, businessId)
    const useFreeTrial =
      access.allowed && access.accounting === 'legacy' && access.useFreeTrial === true
    const consumed = await consumeRenderUsage(db, {
      businessId,
      generationId,
      sourceType: 'week_plan_item',
      sourceId: item.id,
      useFreeTrial,
    })
    charged = consumed.charged || consumed.alreadyCharged
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Could not charge render credit')
  }

  const baseBrief = item.user_brief?.trim() || item.topic.trim()
  const userBrief = `${baseBrief}\n\nAdjustment: ${trimmed}`
  const intentChip = parseAiDesignedIntentChip(item.intent_chip)

  const result = await runDesignedVariants(db, {
    businessId,
    userBrief,
    intentChip,
    jobId: item.job_id,
    showLogo: true,
  })

  if (!result.ok || shouldRefundDesignedGeneration(result.variants?.length ?? 0)) {
    if (charged) {
      await refundRenderUsage(db, { businessId, generationId }).catch(() => {})
    }
    throw new Error(result.ok ? 'All three versions failed' : result.error)
  }

  const storedVariants = toStoredVariantPreviews(result.variants)
  const primaryAngle = result.variants[0]?.messageAngle ?? recreateMessageAngleAt(0)

  const { data: business } = await db
    .from('businesses')
    .select('name, ai_agent_services, suburb, social_brand_voice, social_default_cta, phone, website')
    .eq('id', businessId)
    .maybeSingle()

  let job = null
  if (item.job_id) {
    const { data: jobRow } = await db
      .from('jobs')
      .select('title, notes, site_suburb, site_state')
      .eq('id', item.job_id)
      .eq('business_id', businessId)
      .maybeSingle()
    if (jobRow) {
      job = {
        title: jobRow.title,
        description: jobRow.notes,
        suburb: jobRow.site_suburb,
        state: jobRow.site_state,
      }
    }
  }

  const caption = await generateDesignedCaption({
    businessId,
    designed: {
      userBrief,
      messageAngle: primaryAngle,
      intentChip,
      jobId: item.job_id,
      generationMode: 'ai_designed',
      generationSource: 'week_plan',
    },
    business: {
      name: business?.name ?? 'Business',
      services: business?.ai_agent_services ?? null,
      suburb: business?.suburb ?? null,
      brandVoice: business?.social_brand_voice ?? null,
      cta: business?.social_default_cta ?? null,
      phone: business?.phone ?? null,
      website: business?.website ?? null,
    },
    job,
  })

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      variant_previews_previous: item.variant_previews,
      variant_previews: storedVariants,
      caption,
      selected_variant_id: null,
      review_status: 'needs_selection',
      hybrid_render_id: null,
      approved_at: null,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function scheduleWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  params: {
    scheduledDate: string
    scheduledTime: string
    platforms: SocialPublishPlatform[]
    publishingMode: SocialPublishingMode
    connected: SocialConnectionState
  },
): Promise<{ item: WeekPlanItemRow; postId: string; scheduledFor: string; alreadyScheduled?: boolean }> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { plan, item } = loaded

  if (item.scheduled_social_post_id && item.review_status === 'scheduled') {
    const { data: existingPost } = await db
      .from('social_posts')
      .select('id, scheduled_for')
      .eq('id', item.scheduled_social_post_id)
      .eq('business_id', businessId)
      .maybeSingle()

    if (existingPost?.scheduled_for) {
      return {
        item,
        postId: existingPost.id,
        scheduledFor: existingPost.scheduled_for,
        alreadyScheduled: true,
      }
    }
  }

  if (item.scheduled_social_post_id) {
    throw new Error('This post is already scheduled')
  }
  if (item.review_status !== 'approved' || !item.hybrid_render_id) {
    throw new Error('Approve this post before scheduling')
  }
  if (!item.caption?.trim()) {
    throw new Error('Add a caption before scheduling')
  }

  const modeResult = resolveSchedulePublishingMode(
    params.publishingMode,
    params.platforms,
    params.connected,
  )
  if (!modeResult.ok) throw new Error(modeResult.message)

  const { data: render, error: renderErr } = await db
    .from('hybrid_social_renders')
    .select('id, result_url, business_id')
    .eq('id', item.hybrid_render_id)
    .eq('business_id', businessId)
    .maybeSingle()

  if (renderErr || !render?.result_url) {
    throw new Error('Finalized image not found')
  }

  const body = buildLibrarySocialPostBody({
    caption: item.caption,
    platforms: params.platforms,
    resultUrl: render.result_url,
    jobId: item.job_id,
    mode: 'schedule',
    scheduledDate: params.scheduledDate,
    scheduledTime: params.scheduledTime,
  })

  const { data: post, error: postErr } = await db
    .from('social_posts')
    .insert({
      business_id: businessId,
      caption: body.caption,
      platforms: body.platforms,
      photo_urls: body.photoUrls,
      processed_photo_urls: body.processedPhotoUrls,
      scheduled_for: body.scheduledFor,
      status: 'scheduled',
      publishing_mode: modeResult.mode,
      week_plan_item_id: itemId,
      job_id: body.jobId ?? null,
    })
    .select('id')
    .single()

  if (postErr || !post?.id) throw new Error(postErr?.message || 'Could not create scheduled post')

  const now = new Date().toISOString()
  const { data: updatedItem, error: itemErr } = await db
    .from('social_week_plan_items')
    .update({
      review_status: 'scheduled',
      scheduled_social_post_id: post.id,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (itemErr) throw new Error(itemErr.message)

  const serialized = serializeItemRow(updatedItem)
  const allItems = (await loadPlanForBusiness(db, businessId, planId))!.items.map((i) =>
    i.id === serialized.id ? serialized : i,
  )
  await syncPlanProductionComplete(db, plan, allItems)

  return {
    item: serialized,
    postId: post.id,
    scheduledFor: body.scheduledFor ?? '',
  }
}

export async function approveAllReadyWeekPlanItems(
  db: SupabaseClient,
  businessId: string,
  planId: string,
): Promise<{ approved: WeekPlanItemRow[]; errors: string[] }> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) throw new Error('Plan not found')

  const approved: WeekPlanItemRow[] = []
  const errors: string[] = []

  for (const item of loaded.items) {
    if (item.review_status !== 'selected') continue
    if (!itemHasValidSelection(item)) continue
    try {
      approved.push(await approveWeekPlanItem(db, businessId, planId, item.id))
    } catch (err) {
      errors.push(
        `${item.topic.slice(0, 40)}: ${err instanceof Error ? err.message : 'Approve failed'}`,
      )
    }
  }

  return { approved, errors }
}
