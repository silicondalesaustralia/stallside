import type { SupabaseClient } from '@supabase/supabase-js'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import {
  consumeRenderUsage,
  evaluateUsageAccess,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import {
  AI_DESIGNED_SET_CREDIT_COST,
  parseDesignedGenerationId,
  shouldRefundDesignedGeneration,
} from '@/lib/social/designedCredits'
import { parseAiDesignedIntentChip } from '@/lib/social/designedIntents'
import { generateDesignedCaption } from '@/lib/social/generateDesignedCaption'
import { runDesignedVariants } from '@/lib/social/runDesignedVariants'
import { recreateMessageAngleAt } from '@/lib/social/recreateMessageAngles'
import { syncPlanGenerationStatus } from '@/lib/social/weekPlan/weekPlanGenerationProgress'
import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'
import { toStoredVariantPreviews } from '@/lib/social/weekPlan/weekPlanVariantStorage'

export type ProcessWeekPlanItemResult =
  | { ok: true; itemId: string; variantCount: number }
  | { ok: false; itemId: string; error: string; refunded: boolean }

export async function processWeekPlanItem(
  db: SupabaseClient,
  item: WeekPlanItemRow,
): Promise<ProcessWeekPlanItemResult> {
  if (!isAiDesignedEnabled()) {
    await markItemFailed(db, item, 'AI Designed is not enabled')
    await syncPlanGenerationStatus(db, item.plan_id, item.business_id)
    return { ok: false, itemId: item.id, error: 'AI Designed is not enabled', refunded: false }
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    await markItemFailed(db, item, 'OPENAI_API_KEY is not configured')
    await syncPlanGenerationStatus(db, item.plan_id, item.business_id)
    return { ok: false, itemId: item.id, error: 'Image generation unavailable', refunded: false }
  }

  const generationId = parseDesignedGenerationId(item.generation_id)
  let charged = false
  let useFreeTrial = false

  try {
    const access = await evaluateUsageAccess(db, item.business_id)
    useFreeTrial =
      access.allowed && access.accounting === 'legacy' && access.useFreeTrial === true

    const consumed = await consumeRenderUsage(db, {
      businessId: item.business_id,
      generationId,
      sourceType: 'week_plan_item',
      sourceId: item.id,
      useFreeTrial,
    })
    charged = consumed.charged || consumed.alreadyCharged
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not charge render credit'
    await markItemFailed(db, item, message)
    await syncPlanGenerationStatus(db, item.plan_id, item.business_id)
    return { ok: false, itemId: item.id, error: message, refunded: false }
  }

  const userBrief = item.user_brief?.trim() || item.topic.trim()
  const intentChip = parseAiDesignedIntentChip(item.intent_chip)

  const result = await runDesignedVariants(db, {
    businessId: item.business_id,
    userBrief,
    intentChip,
    jobId: item.job_id,
    showLogo: true,
  })

  if (!result.ok || shouldRefundDesignedGeneration(result.variants?.length ?? 0)) {
    if (charged) {
      await refundRenderUsage(db, {
        businessId: item.business_id,
        generationId,
      }).catch((err) => {
        console.error('[WeekPlan][process] Refund failed', { itemId: item.id, err })
      })
    }
    const error = result.ok ? 'All three versions failed' : result.error
    await markItemFailed(db, item, error)
    await syncPlanGenerationStatus(db, item.plan_id, item.business_id)
    return { ok: false, itemId: item.id, error, refunded: charged }
  }

  const storedVariants = toStoredVariantPreviews(result.variants)
  const primaryAngle = result.variants[0]?.messageAngle ?? recreateMessageAngleAt(0)

  const { data: business } = await db
    .from('businesses')
    .select(
      'name, ai_agent_services, suburb, social_brand_voice, social_default_cta, phone, website',
    )
    .eq('id', item.business_id)
    .maybeSingle()

  let job = null
  if (item.job_id) {
    const { data: jobRow } = await db
      .from('jobs')
      .select('title, notes, site_suburb, site_state')
      .eq('id', item.job_id)
      .eq('business_id', item.business_id)
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
    businessId: item.business_id,
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
  const { error: updErr } = await db
    .from('social_week_plan_items')
    .update({
      generation_id: generationId,
      generation_status: 'generated',
      generation_error: null,
      variant_previews: storedVariants,
      caption,
      generation_completed_at: now,
      updated_at: now,
    })
    .eq('id', item.id)
    .eq('business_id', item.business_id)
    .eq('generation_status', 'generating')

  if (updErr) {
    console.error('[WeekPlan][process] Persist failed', { itemId: item.id, updErr })
    await markItemFailed(db, item, 'Failed to save generated previews')
    await syncPlanGenerationStatus(db, item.plan_id, item.business_id)
    return { ok: false, itemId: item.id, error: updErr.message, refunded: false }
  }

  await syncPlanGenerationStatus(db, item.plan_id, item.business_id)

  console.log('[WeekPlan][process] Success', {
    itemId: item.id,
    variantCount: storedVariants.length,
    credits: AI_DESIGNED_SET_CREDIT_COST,
  })

  return { ok: true, itemId: item.id, variantCount: storedVariants.length }
}

async function markItemFailed(
  db: SupabaseClient,
  item: WeekPlanItemRow,
  error: string,
): Promise<void> {
  const now = new Date().toISOString()
  await db
    .from('social_week_plan_items')
    .update({
      generation_status: 'failed',
      generation_error: error.slice(0, 500),
      generation_completed_at: now,
      updated_at: now,
    })
    .eq('id', item.id)
    .eq('business_id', item.business_id)
    .in('generation_status', ['queued', 'generating'])
}
