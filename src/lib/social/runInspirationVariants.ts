/**
 * Generate inspiration Recreate variants.
 * Flag off: legacy template previews (no credit).
 * Flag on: 3 parallel gpt-image-2 reference edits (credit charged by caller).
 */

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ComposePlatform, ContentFormat, InfographicPreset, PhotoSource } from '@/lib/social/composeModel'
import { generateInfographicContent } from '@/lib/social/infographicContent'
import {
  generateInspirationQuoteContent,
  generateInspirationSceneContent,
  inspirationAiBackgroundForTheme,
  inspirationVariantLabel,
} from '@/lib/social/generateInspirationVariantContent'
import type {
  InspirationComposePrefill,
  InspirationVariantPreview,
} from '@/lib/social/inspirationTypes'
import { runHybridSocialRender } from '@/lib/social/runHybridSocialRender'
import { DEFAULT_POST_SUBTYPE_ID } from '@/lib/social/postTaxonomy'
import { defaultSceneCta } from '@/lib/social/sceneContent'
import { parseSocialTextStyles } from '@/lib/social/socialTextStyle'
import { parseSocialLogoCorner } from '@/lib/social/socialLogoCorner'
import { isRecreateReferenceImageEnabled } from '@/lib/social/recreateImageConfig'
import { generateRecreateImage, type RecreateImageQuality } from '@/lib/social/generateRecreateImage'
import { variantMessagingFromContent } from '@/lib/social/recreateImagePrompt'
import { storeRecreateVisual } from '@/lib/social/storeRecreateVisual'
import {
  downloadInspirationTempImage,
  isOwnedInspirationTempPath,
} from '@/lib/social/inspirationTempStorage'
import { logRecreateAnalytics } from '@/lib/social/recreateAnalytics'
import { recreateMessageAngleAt } from '@/lib/social/recreateMessageAngles'
import type { RecreateMode } from '@/lib/social/recreateModes'
import { parseCampaignFocus } from '@/lib/social/normalizeCampaignFocus'
import { applyRecreateBusinessLogo } from '@/lib/social/compositeRecreateLogo'
import {
  RECREATE_DEFAULT_LOGO_POSITION,
  RECREATE_DEFAULT_LOGO_SIZE,
} from '@/lib/social/recreateLogoPlacement'
import {
  parseRecreateLogoChoice,
  recreateBaseStoragePath,
  recreatePreviewStoragePath,
  resolveRecreateLogoAsset,
  type RecreateLogoChoice,
} from '@/lib/brand/businessBrandLogos'

export const INSPIRATION_VARIANT_COUNT = 3

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
  social_text_styles: unknown
  social_logo_corner: string | null
  logo_url: string | null
}

function applyLockedCta(format: ContentFormat, content: unknown, cta: string): unknown {
  if (!content || typeof content !== 'object') return content
  const row = content as Record<string, unknown>
  if (format === 'scene') return { ...row, cta }
  if (format === 'quote_card') return { ...row, ctaLine: cta }
  if (format === 'infographic' && 'footerCta' in row) return { ...row, footerCta: cta }
  return content
}

export type RecreateVariantSlotEvent =
  | { type: 'variant'; index: number; variant: InspirationVariantPreview }
  | { type: 'variant_failed'; index: number; error: string; messageAngle: string }

export type RunInspirationVariantsInput = {
  businessId: string
  prefill: InspirationComposePrefill
  platform?: ComposePlatform
  /** Temp inspiration-temp path - used as gpt-image-2 reference, then deleted by caller. */
  referenceStoragePath?: string | null
  recreateMode?: RecreateMode
  campaignFocus?: string | null
  /** Composite the real business logo after GPT-Image-2. Default true. */
  showLogo?: boolean
  /** Library asset id, or null/"none" for no logo. Omitted = Primary. */
  logoAssetId?: string | null
  imageQuality?: RecreateImageQuality
  onSlot?: (event: RecreateVariantSlotEvent) => void | Promise<void>
  generateImage?: typeof generateRecreateImage
  storeVisual?: typeof storeRecreateVisual
  /** Tests only - skip temp download. */
  referenceOverride?: { buffer: Buffer; mimeType: string }
  buildContent?: typeof buildVariantContent
  /** Tests only - replace legacy template render. */
  legacyRender?: typeof runHybridSocialRender
  applyLogo?: typeof applyRecreateBusinessLogo
}

export type RunInspirationVariantsResult =
  | {
      ok: true
      variants: InspirationVariantPreview[]
      failedIndexes: number[]
      visualPath: 'reference_recreation' | 'legacy_template'
      referenceMissing?: boolean
    }
  | {
      ok: false
      error: string
      code?:
        | 'reference_missing'
        | 'business_not_found'
        | 'invalid_logo'
        | 'logo_not_found'
        | 'invalid_campaign_focus'
    }

async function buildVariantContent(
  format: ContentFormat,
  prefill: InspirationComposePrefill,
  business: BusinessRow,
  variantIndex: number,
): Promise<unknown> {
  const hints = prefill.hints
  const base = {
    business,
    hints,
    variantIndex,
    variantCount: INSPIRATION_VARIANT_COUNT,
  }

  if (format === 'scene') {
    return generateInspirationSceneContent({ ...base, format: 'scene' })
  }
  if (format === 'quote_card') {
    return generateInspirationQuoteContent({ ...base, format: 'quote_card' })
  }

  const infographic = await generateInfographicContent({
    preset: prefill.infographicPreset,
    platform: 'instagram',
    postSubtype: DEFAULT_POST_SUBTYPE_ID,
    business,
    generationHints: hints,
    variantIndex,
    variantCount: INSPIRATION_VARIANT_COUNT,
  })
  return infographic.content
}

async function loadSceneOptions(
  db: SupabaseClient,
  photoSource: PhotoSource,
): Promise<Array<{ id: string; purpose: string }>> {
  if (photoSource !== 'ai_generate') return []
  const { data: scenes } = await db
    .from('ai_image_scene_options')
    .select('id, purpose, sort_order')
    .eq('purpose', 'job_showcase')
    .order('sort_order', { ascending: true })
    .limit(9)
  if (scenes?.length) return scenes
  const { data: fallback } = await db
    .from('ai_image_scene_options')
    .select('id, purpose, sort_order')
    .order('sort_order', { ascending: true })
    .limit(9)
  return fallback ?? []
}

export async function runInspirationVariants(
  db: SupabaseClient,
  input: RunInspirationVariantsInput,
): Promise<RunInspirationVariantsResult> {
  const platform: ComposePlatform = input.platform ?? 'instagram'
  const { prefill } = input
  const format = prefill.format
  const photoSource: PhotoSource = prefill.photoSource
  const recreateMode: RecreateMode = input.recreateMode ?? 'closest'
  const parsedFocus = parseCampaignFocus(input.campaignFocus)
  if (!parsedFocus.ok) {
    return { ok: false, error: parsedFocus.error, code: 'invalid_campaign_focus' }
  }
  const campaignFocus = parsedFocus.value
  const generateImage = input.generateImage ?? generateRecreateImage
  const storeVisual = input.storeVisual ?? storeRecreateVisual
  const buildContent = input.buildContent ?? buildVariantContent

  const { data: business } = await db
    .from('businesses')
    .select(
      'name, phone, website, suburb, brand_color, brand_text_color, ai_agent_services, social_default_cta, social_brand_voice, social_text_styles, social_logo_corner, logo_url',
    )
    .eq('id', input.businessId)
    .maybeSingle()

  if (!business) {
    return { ok: false, error: 'Business not found', code: 'business_not_found' }
  }

  const biz = business as BusinessRow
  const lockedCta = defaultSceneCta(biz)
  const textStyles = parseSocialTextStyles(biz.social_text_styles)
  const logoCorner = parseSocialLogoCorner(biz.social_logo_corner)

  let referenceBuffer: Buffer | null = input.referenceOverride?.buffer ?? null
  let referenceMimeType = input.referenceOverride?.mimeType ?? 'image/jpeg'
  const referencePathEnabled = isRecreateReferenceImageEnabled()
  const referencePath = input.referenceStoragePath?.trim() || null
  if (
    !referenceBuffer &&
    referencePathEnabled &&
    referencePath &&
    isOwnedInspirationTempPath(input.businessId, referencePath)
  ) {
    const downloaded = await downloadInspirationTempImage(db, referencePath)
    if ('buffer' in downloaded) {
      referenceBuffer = downloaded.buffer
      referenceMimeType = downloaded.mimeType
    } else {
      console.error('[InspirationVariants] reference download failed', {
        error: downloaded.error,
      })
    }
  }

  if (referencePathEnabled) {
    if (!referenceBuffer) {
      return {
        ok: false,
        error: 'Please re-upload the screenshot. The reference file is no longer available.',
        code: 'reference_missing',
      }
    }

    return runReferenceRecreationSet({
      db,
      input,
      biz,
      format,
      photoSource,
      recreateMode,
      campaignFocus,
      referenceBuffer,
      referenceMimeType,
      lockedCta,
      generateImage,
      storeVisual,
      buildContent,
      applyLogo: input.applyLogo ?? applyRecreateBusinessLogo,
    })
  }

  const sceneOptions = await loadSceneOptions(db, photoSource)
  const variants: InspirationVariantPreview[] = []

  for (let i = 0; i < INSPIRATION_VARIANT_COUNT; i++) {
    const variantId = randomUUID()
    let content: unknown
    try {
      content = applyLockedCta(
        format,
        await buildContent(format, prefill, biz, i),
        lockedCta,
      )
    } catch (err) {
      console.error('[InspirationVariants] content generation failed', {
        variantIndex: i,
        format,
        detail: err instanceof Error ? err.message : String(err),
      })
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to generate variant copy',
      }
    }

    const aiBackgroundBase =
      photoSource === 'ai_generate' || photoSource === 'custom_prompt'
        ? inspirationAiBackgroundForTheme(prefill.hints, i)
        : null

    const aiBackground =
      aiBackgroundBase && sceneOptions.length > 0
        ? {
            ...aiBackgroundBase,
            sceneId: sceneOptions[i % sceneOptions.length].id,
            purpose: 'job_showcase',
          }
        : aiBackgroundBase

    const renderResult = await (input.legacyRender ?? runHybridSocialRender)(db, {
      businessId: input.businessId,
      format,
      platform,
      photoSource,
      photoUrl: null,
      preset: format === 'infographic' ? prefill.infographicPreset : undefined,
      content,
      textStyles,
      logoCorner,
      showLogo: true,
      returnBackgroundUrl: photoSource !== 'none',
      backgroundStoragePath: `${input.businessId}/inspiration-preview/${variantId}-bg.webp`,
      aiBackground,
      aiDesignedBackground:
        format === 'infographic' && photoSource === 'none' ? false : undefined,
      chargeCredits: false,
      persistHybridRow: false,
      storagePath: `${input.businessId}/inspiration-preview/${variantId}.webp`,
      renderId: variantId,
    })

    if (!renderResult.ok) {
      console.error('[InspirationVariants] legacy_template render failed', {
        variantIndex: i,
        error: renderResult.error,
      })
      return { ok: false, error: renderResult.error || 'Variant render failed' }
    }

    const messaging = variantMessagingFromContent(content, i)
    const variant: InspirationVariantPreview = {
      id: variantId,
      label: inspirationVariantLabel(i),
      imageUrl: renderResult.imageUrl,
      format,
      infographicPreset:
        format === 'infographic' ? (prefill.infographicPreset as InfographicPreset) : undefined,
      photoSource,
      content,
      backgroundUrl: renderResult.backgroundUrl ?? null,
      visualPath: 'legacy_template',
      messageAngle: messaging.angleId,
      ...(aiBackground ? { aiBackground } : {}),
    }
    variants.push(variant)
    await input.onSlot?.({ type: 'variant', index: i, variant })
  }

  return { ok: true, variants, failedIndexes: [], visualPath: 'legacy_template' }
}

async function runReferenceRecreationSet(params: {
  db: SupabaseClient
  input: RunInspirationVariantsInput
  biz: BusinessRow
  format: ContentFormat
  photoSource: PhotoSource
  recreateMode: RecreateMode
  campaignFocus: string | null
  referenceBuffer: Buffer
  referenceMimeType: string
  lockedCta: string
  generateImage: typeof generateRecreateImage
  storeVisual: typeof storeRecreateVisual
  buildContent: typeof buildVariantContent
  applyLogo: typeof applyRecreateBusinessLogo
}): Promise<RunInspirationVariantsResult> {
  const {
    db,
    input,
    biz,
    format,
    photoSource,
    recreateMode,
    campaignFocus,
    referenceBuffer,
    referenceMimeType,
    lockedCta,
    generateImage,
    storeVisual,
    buildContent,
    applyLogo,
  } = params
  const { prefill } = input
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

  const contents = await Promise.all(
    Array.from({ length: INSPIRATION_VARIANT_COUNT }, async (_, i) => {
      const content = applyLockedCta(
        format,
        await buildContent(format, prefill, biz, i),
        lockedCta,
      )
      return content
    }),
  )

  const started = Date.now()
  const settled = await Promise.allSettled(
    contents.map(async (content, i) => {
      const variantId = randomUUID()
      const messaging = variantMessagingFromContent(content, i)
      const generated = await generateImage({
        referenceBuffer,
        referenceMimeType,
        business: biz,
        hints: prefill.hints,
        messaging,
        recreateMode,
        campaignFocus,
        applyRealLogo,
        quality: input.imageQuality,
        usageContext: {
          businessId: input.businessId,
          feature: 'social_recreate',
          customerCreditsCharged: 0,
        },
      })
      const baseStored = await storeVisual(db, {
        businessId: input.businessId,
        renderId: variantId,
        buffer: generated.buffer,
        storagePath: recreateBaseStoragePath(input.businessId, variantId),
      })
      const logoApplied = await applyLogo({
        imageBuffer: generated.buffer,
        logoUrl: logoFetchUrl,
        showLogo: applyRealLogo,
        logoPosition: RECREATE_DEFAULT_LOGO_POSITION,
        logoSize: RECREATE_DEFAULT_LOGO_SIZE,
        resolveLogoUrl: async (url) => url,
      })
      const stored = await storeVisual(db, {
        businessId: input.businessId,
        renderId: variantId,
        buffer: logoApplied.buffer,
        storagePath: recreatePreviewStoragePath(input.businessId, variantId),
      })
      const variant: InspirationVariantPreview = {
        id: variantId,
        label: inspirationVariantLabel(i),
        imageUrl: stored.imageUrl,
        format,
        infographicPreset:
          format === 'infographic' ? (prefill.infographicPreset as InfographicPreset) : undefined,
        photoSource,
        content,
        backgroundUrl: stored.imageUrl,
        visualPath: 'reference_recreation',
        recreateMode,
        messageAngle: messaging.angleId,
        campaignFocus,
        imageModel: generated.model,
        estimatedUsd: generated.estimatedUsd,
        latencyMs: generated.durationMs,
        baseStoragePath: baseStored.storagePath,
        logoAssetId: asset?.id ?? null,
        logoVariantType: asset ? asset.variant_type : null,
        logoDisabled: !applyRealLogo,
        logoPosition: RECREATE_DEFAULT_LOGO_POSITION,
        logoSize: RECREATE_DEFAULT_LOGO_SIZE,
      }
      logRecreateAnalytics('recreate_variant_ready', {
        recreateMode,
        messageAngle: messaging.angleId,
        visualPath: 'reference_recreation',
        latencyMs: generated.durationMs,
        estimatedUsd: generated.estimatedUsd ?? null,
        hadCampaignFocus: Boolean(campaignFocus),
      })
      await input.onSlot?.({ type: 'variant', index: i, variant })
      return variant
    }),
  )

  const variants: InspirationVariantPreview[] = []
  const failedIndexes: number[] = []

  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      variants.push(result.value)
      return
    }
    failedIndexes.push(i)
    const error = result.reason instanceof Error ? result.reason.message : 'This version failed'
    logRecreateAnalytics('recreate_variant_failed', {
      recreateMode,
      messageAngle: recreateMessageAngleAt(i),
      visualPath: 'reference_recreation',
      hadCampaignFocus: Boolean(campaignFocus),
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

  console.log('[InspirationVariants] reference set complete', {
    succeeded: variants.length,
    failed: failedIndexes.length,
    elapsedMs: Date.now() - started,
    recreateMode,
  })

  return {
    ok: true,
    variants,
    failedIndexes,
    visualPath: 'reference_recreation',
  }
}

