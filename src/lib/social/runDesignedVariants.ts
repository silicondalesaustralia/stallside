/**
 * Generate 3 AI Designed versions in parallel.
 * Never calls renderScene, infographic, quote, or hybrid overlay.
 */

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AI_DESIGNED_VISUAL_PATH } from '@/lib/social/aiDesignedConfig'
import { logDesignedAnalytics } from '@/lib/social/designedAnalytics'
import type { DesignedJobContext } from '@/lib/social/designedImagePrompt'
import {
  parseDesignedGenerateInput,
  type AiDesignedIntentId,
} from '@/lib/social/designedIntents'
import type { DesignedVariantPreview } from '@/lib/social/designedTypes'
import {
  designedVisualAuditMeta,
  type DesignedResolvedVisual,
  type DesignedVisualInput,
} from '@/lib/social/designedVisualInputs'
import { generateDesignedImage, type DesignedImageQuality } from '@/lib/social/generateDesignedImage'
import { resolveDesignedVisualInputs } from '@/lib/social/resolveDesignedVisualInputs'
import { applyRecreateBusinessLogo } from '@/lib/social/compositeRecreateLogo'
import { storeRecreateVisual } from '@/lib/social/storeRecreateVisual'
import {
  parseRecreateLogoPosition,
  parseRecreateLogoSize,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import {
  RECREATE_MESSAGE_ANGLE_LABELS,
  RECREATE_MESSAGE_ANGLES,
  recreateMessageAngleAt,
} from '@/lib/social/recreateMessageAngles'
import {
  designedBaseStoragePath,
  designedPreviewStoragePath,
  parseRecreateLogoChoice,
  resolveRecreateLogoAsset,
  type RecreateLogoChoice,
} from '@/lib/brand/businessBrandLogos'

export const DESIGNED_VARIANT_COUNT = 3

type BusinessRow = {
  name: string | null
  phone: string | null
  website: string | null
  suburb: string | null
  brand_color: string | null
  brand_text_color: string | null
  ai_agent_services: string | null
  social_default_cta: string | null
  social_brand_voice: string | null
  logo_url: string | null
}

export type DesignedVariantSlotEvent =
  | { type: 'variant'; index: number; variant: DesignedVariantPreview }
  | { type: 'variant_failed'; index: number; error: string; messageAngle: string }

export type RunDesignedVariantsInput = {
  businessId: string
  userBrief?: string | null
  intentChip?: AiDesignedIntentId | null
  jobId?: string | null
  showLogo?: boolean
  logoAssetId?: string | null
  logoPosition?: RecreateLogoPosition
  logoSize?: RecreateLogoSize
  imageQuality?: DesignedImageQuality
  visualInputs?: DesignedVisualInput[]
  resolvedVisuals?: DesignedResolvedVisual[]
  onSlot?: (event: DesignedVariantSlotEvent) => void | Promise<void>
  generateImage?: typeof generateDesignedImage
  storeVisual?: typeof storeRecreateVisual
  applyLogo?: typeof applyRecreateBusinessLogo
}

export type RunDesignedVariantsResult =
  | {
      ok: true
      variants: DesignedVariantPreview[]
      failedIndexes: number[]
      visualPath: typeof AI_DESIGNED_VISUAL_PATH
    }
  | {
      ok: false
      error: string
      code?:
        | 'invalid_brief'
        | 'missing_brief_or_chip'
        | 'business_not_found'
        | 'invalid_logo'
        | 'logo_not_found'
        | 'invalid_job'
        | 'visual_not_found'
        | 'visual_forbidden'
        | 'visual_invalid'
    }

export async function runDesignedVariants(
  db: SupabaseClient,
  input: RunDesignedVariantsInput,
): Promise<RunDesignedVariantsResult> {
  const parsed = parseDesignedGenerateInput({
    userBrief: input.userBrief,
    intentChip: input.intentChip,
  })
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, code: parsed.code }
  }
  const { userBrief, intentChip } = parsed
  const generateImage = input.generateImage ?? generateDesignedImage
  const storeVisual = input.storeVisual ?? storeRecreateVisual
  const applyLogo = input.applyLogo ?? applyRecreateBusinessLogo

  const { data: business } = await db
    .from('businesses')
    .select(
      'name, phone, website, suburb, brand_color, brand_text_color, ai_agent_services, social_default_cta, social_brand_voice, logo_url',
    )
    .eq('id', input.businessId)
    .maybeSingle()

  const biz = business as BusinessRow | null
  if (!biz) return { ok: false, error: 'Business not found', code: 'business_not_found' }

  let job: DesignedJobContext | null = null
  const jobId = input.jobId?.trim() || null
  if (jobId) {
    const { data: jobRow } = await db
      .from('jobs')
      .select('id, title, notes, site_suburb, site_state, business_id')
      .eq('id', jobId)
      .eq('business_id', input.businessId)
      .maybeSingle()
    if (!jobRow) {
      return { ok: false, error: 'Job not found', code: 'invalid_job' }
    }
    const row = jobRow as {
      title?: string | null
      notes?: string | null
      site_suburb?: string | null
      site_state?: string | null
    }
    job = {
      title: row.title ?? null,
      description: row.notes ?? null,
      suburb: row.site_suburb ?? null,
      state: row.site_state ?? null,
    }
  }

  const parsedChoice = parseRecreateLogoChoice({
    logoAssetId: input.logoAssetId,
    showLogo: input.showLogo,
  })
  if ('ok' in parsedChoice) {
    return { ok: false, error: parsedChoice.error, code: 'invalid_logo' }
  }
  const logoChoice: RecreateLogoChoice = parsedChoice
  let resolved
  try {
    resolved = await resolveRecreateLogoAsset(db, input.businessId, logoChoice, biz.logo_url)
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : ''
    if (code === 'logo_not_found') {
      return { ok: false, error: 'Logo not found', code: 'logo_not_found' }
    }
    throw err
  }
  const { applyRealLogo, asset, fetchUrl: logoFetchUrl } = resolved

  const parsedPosition = parseRecreateLogoPosition(input.logoPosition)
  if (typeof parsedPosition === 'object' && 'ok' in parsedPosition) {
    return { ok: false, error: parsedPosition.error, code: 'invalid_logo' }
  }
  const logoPosition = parsedPosition
  const parsedSize = parseRecreateLogoSize(input.logoSize)
  if (typeof parsedSize === 'object' && 'ok' in parsedSize) {
    return { ok: false, error: parsedSize.error, code: 'invalid_logo' }
  }
  const logoSize = parsedSize

  let resolvedVisuals = input.resolvedVisuals ?? []
  if (!resolvedVisuals.length && input.visualInputs?.length) {
    const resolved = await resolveDesignedVisualInputs(db, input.businessId, input.visualInputs)
    if (!resolved.ok) {
      return { ok: false, error: resolved.error, code: resolved.code }
    }
    resolvedVisuals = resolved.visuals
  }
  const visualAudit = designedVisualAuditMeta(resolvedVisuals)

  const started = Date.now()
  const settled = await Promise.allSettled(
    Array.from({ length: DESIGNED_VARIANT_COUNT }, async (_, i) => {
      const variantId = randomUUID()
      const messageAngle = recreateMessageAngleAt(i)
      const generated = await generateImage({
        business: biz,
        messageAngle,
        userBrief,
        intentChip,
        job,
        visualInputs: resolvedVisuals,
        applyRealLogo,
        quality: input.imageQuality,
        usageContext: {
          businessId: input.businessId,
          feature: 'social_image',
          customerCreditsCharged: 0,
        },
      })
      const baseStored = await storeVisual(db, {
        businessId: input.businessId,
        renderId: variantId,
        buffer: generated.buffer,
        storagePath: designedBaseStoragePath(input.businessId, variantId),
      })
      const logoApplied = await applyLogo({
        imageBuffer: generated.buffer,
        logoUrl: logoFetchUrl,
        showLogo: applyRealLogo,
        logoPosition,
        logoSize,
        resolveLogoUrl: async (url) => url,
      })
      const stored = await storeVisual(db, {
        businessId: input.businessId,
        renderId: variantId,
        buffer: logoApplied.buffer,
        storagePath: designedPreviewStoragePath(input.businessId, variantId),
      })
      const variant: DesignedVariantPreview = {
        id: variantId,
        label: RECREATE_MESSAGE_ANGLE_LABELS[messageAngle],
        imageUrl: stored.imageUrl,
        visualPath: AI_DESIGNED_VISUAL_PATH,
        messageAngle,
        userBrief,
        intentChip,
        jobId,
        imageModel: generated.model,
        estimatedUsd: generated.estimatedUsd,
        latencyMs: generated.durationMs,
        baseStoragePath: baseStored.storagePath,
        logoAssetId: asset?.id ?? null,
        logoVariantType: asset ? asset.variant_type : null,
        logoDisabled: !applyRealLogo,
        logoPosition,
        logoSize,
        generationMode: 'ai_designed',
        generationSource: 'ai_designed_scratch',
        visualInputs: visualAudit,
      }
      logDesignedAnalytics('ai_designed_variant_ready', {
        messageAngle,
        latencyMs: generated.durationMs,
        estimatedUsd: generated.estimatedUsd ?? null,
        hadUserBrief: Boolean(userBrief),
        intentChip: intentChip ?? null,
        logoVariantType: variant.logoVariantType,
        logoPosition: variant.logoPosition,
        logoSize: variant.logoSize,
        logoDisabled: variant.logoDisabled,
      })
      await input.onSlot?.({ type: 'variant', index: i, variant })
      return variant
    }),
  )

  const variants: DesignedVariantPreview[] = []
  const failedIndexes: number[] = []

  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      variants.push(result.value)
      return
    }
    failedIndexes.push(i)
    const error = result.reason instanceof Error ? result.reason.message : 'This version failed'
    logDesignedAnalytics('ai_designed_variant_failed', {
      messageAngle: recreateMessageAngleAt(i),
      hadUserBrief: Boolean(userBrief),
      intentChip: intentChip ?? null,
    })
    void input.onSlot?.({
      type: 'variant_failed',
      index: i,
      error,
      messageAngle: recreateMessageAngleAt(i),
    })
  })

  if (variants.length === 0) {
    return { ok: false, error: 'All three versions failed. Your credit was not kept if we could reverse it.' }
  }

  console.log('[AiDesigned] set complete', {
    succeeded: variants.length,
    failed: failedIndexes.length,
    elapsedMs: Date.now() - started,
  })

  return {
    ok: true,
    variants,
    failedIndexes,
    visualPath: AI_DESIGNED_VISUAL_PATH,
  }
}

export { RECREATE_MESSAGE_ANGLES }
