import type { SupabaseClient } from '@supabase/supabase-js'
import { buildDefaultSceneContent } from '@/lib/social/sceneContent'
import { buildDesignedLibraryMeta } from '@/lib/social/designedFinalize'
import { runHybridSocialRender } from '@/lib/social/runHybridSocialRender'
import { AI_DESIGNED_VISUAL_PATH } from '@/lib/social/aiDesignedConfig'
import type { WeekPlanItemRow, WeekPlanVariantPreviewStored } from '@/lib/social/weekPlan/types'
import { findStoredVariant } from '@/lib/social/weekPlan/weekPlanVariantStorage'

export type FinalizeWeekPlanItemResult =
  | { ok: true; hybridRenderId: string; resultUrl: string; reused: boolean }
  | { ok: false; error: string }

/** passThroughVisual finalization - 0 render credits, idempotent per selected variant. */
export async function finalizeWeekPlanItemToLibrary(
  db: SupabaseClient,
  item: WeekPlanItemRow,
  variant: WeekPlanVariantPreviewStored,
): Promise<FinalizeWeekPlanItemResult> {
  if (item.hybrid_render_id && item.selected_variant_id === variant.id) {
    const { data: existing } = await db
      .from('hybrid_social_renders')
      .select('id, result_url')
      .eq('id', item.hybrid_render_id)
      .eq('business_id', item.business_id)
      .maybeSingle()

    if (existing?.result_url) {
      return {
        ok: true,
        hybridRenderId: existing.id,
        resultUrl: existing.result_url,
        reused: true,
      }
    }
  }

  const { data: business } = await db
    .from('businesses')
    .select('name, phone, ai_agent_services, social_default_cta')
    .eq('id', item.business_id)
    .maybeSingle()

  const content = buildDefaultSceneContent({
    name: business?.name ?? 'Business',
    phone: business?.phone ?? null,
    ai_agent_services: business?.ai_agent_services ?? null,
    social_default_cta: business?.social_default_cta ?? null,
  })

  const designedMeta = buildDesignedLibraryMeta({
    messageAngle: variant.messageAngle,
    userBrief: variant.userBrief ?? item.user_brief ?? item.topic,
    intentChip: variant.intentChip ?? item.intent_chip,
    jobId: variant.jobId ?? item.job_id,
    visualPath: AI_DESIGNED_VISUAL_PATH,
    imageModel: variant.imageModel ?? null,
    logoAssetId: variant.logoAssetId ?? null,
    logoVariantType: variant.logoVariantType ?? null,
    logoDisabled: variant.logoDisabled === true,
    logoPosition: variant.logoPosition ?? null,
    logoSize: variant.logoSize ?? null,
  })

  const result = await runHybridSocialRender(db, {
    businessId: item.business_id,
    jobId: item.job_id,
    format: 'scene',
    platform: 'instagram',
    photoSource: 'none',
    photoUrl: variant.imageUrl,
    content,
    showLogo: false,
    passThroughVisual: true,
    chargeCredits: false,
    eligibility: { allowed: true, useFreeTrial: false },
    designedMeta,
  })

  if (!result.ok) {
    return { ok: false, error: result.error || 'Finalization failed' }
  }
  if (!result.renderId || !result.imageUrl) {
    return { ok: false, error: 'Finalization failed' }
  }

  return {
    ok: true,
    hybridRenderId: result.renderId,
    resultUrl: result.imageUrl,
    reused: false,
  }
}

export function selectedVariantForItem(
  item: WeekPlanItemRow,
): WeekPlanVariantPreviewStored | null {
  if (!item.selected_variant_id) return null
  return findStoredVariant(item.variant_previews, item.selected_variant_id)
}

export function itemHasValidSelection(item: WeekPlanItemRow): boolean {
  if (item.generation_status !== 'generated') return false
  if (!item.selected_variant_id) return false
  return Boolean(selectedVariantForItem(item))
}

export function isItemProductionLocked(item: WeekPlanItemRow): boolean {
  return item.review_status === 'scheduled' || item.review_status === 'skipped'
}

/** @deprecated Use isItemEditingLocked from weekPlanPermissions - same behavior. */
export { isItemEditingLocked } from '@/lib/social/weekPlan/weekPlanPermissions'
