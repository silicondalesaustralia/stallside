/**
 * Shared hybrid social render pipeline - used by Compose API and Week Ahead approve.
 */

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type ComposePlatform,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import { parseInfographicContent } from '@/lib/social/infographicContent'
import type { PostSubtypeId } from '@/lib/social/postTaxonomy'
import { isPostSubtypeId } from '@/lib/social/postTaxonomy'
import {
  compositeInfographicOnPhoto,
  renderInfographicOverlayPng,
  resizeHybridPhotoBackground,
} from '@/lib/social/infographic/renderInfographic'
import { parseSceneContent } from '@/lib/social/sceneContent'
import { renderSceneOverlayPng } from '@/lib/social/scene/renderScene'
import { parseQuoteCardContent } from '@/lib/social/quoteCardContent'
import { renderQuoteCardOverlayPng } from '@/lib/social/quoteCard/renderQuoteCard'
import { generateAiPhotoBackgroundBuffer } from '@/lib/social/generateAiPhotoBackground'
import {
  analyzeScenePhotoContrast,
  sceneOpaqueAutoColors,
  type ScrimProfile,
} from '@/lib/social/scene/sceneContrast'
import { computeSceneLayout } from '@/lib/social/scene/sceneLayout'
import {
  applySceneRenderTextColors,
  getSceneColorExplicitFlags,
  parseSocialTextStyles,
  resolveSocialTextStyles,
  type PartialSocialTextStyles,
} from '@/lib/social/socialTextStyle'
import {
  compositeLogoCorner,
  convertToWebP,
  isSharpAvailable,
} from '@/lib/imageProcessor'
import { parseSocialLogoCorner } from '@/lib/social/socialLogoCorner'
import {
  consumeRenderCredits,
  evaluateRenderEligibility,
  type RenderEligibility,
} from '@/lib/renders/consumeRenderCredit'
import {
  consumeRenderUsage,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { resolveHybridAiCharge } from '@/lib/social/hybridRenderCharge'
import { inferCanonicalTrade } from '@/lib/social/canonicalTrades'
import { inferTradeCategory } from '@/lib/social/inferTradeCategory'
import { generateInfographicAiBackgroundBuffer } from '@/lib/social/infographic/generateInfographicAiBackgroundBuffer'
import {
  canAttemptInfographicAiBackground,
  INFOGRAPHIC_AI_BACKGROUND_CREDITS,
  INFOGRAPHIC_RESVG_ONLY_CREDITS,
  isInfographicAiBackgroundEnabled,
} from '@/lib/social/infographic/infographicAiBackgroundFeature'
import {
  mergeRecreateMetaIntoContent,
  type RecreateSavedMeta,
} from '@/lib/social/recreateFinalize'
import {
  mergeDesignedMetaIntoContent,
  type DesignedSavedMeta,
} from '@/lib/social/designedFinalize'

export const SHARP_UNAVAILABLE_MSG = 'Image processing unavailable, please try again'

const HYBRID_SCENE_PRESET = 'scene'
const HYBRID_QUOTE_CARD_PRESET = 'quote_card'

export type AiBackgroundInput = {
  purpose?: string
  sceneId?: string
  style?: string
  customPrompt?: string
  tradeCategory?: string
  jobDescription?: string | null
  extraDetail?: string | null
  /** Inspiration previews: tools/van/job - no portraits. */
  avoidPeople?: boolean
}

export type RunHybridSocialRenderInput = {
  businessId: string
  jobId?: string | null
  format: ContentFormat
  platform?: ComposePlatform
  photoSource: PhotoSource
  photoUrl?: string | null
  preset?: InfographicPreset
  content: unknown
  postSubtype?: PostSubtypeId | null
  logoCorner?: string | null
  textStyles?: PartialSocialTextStyles | null
  aiBackground?: AiBackgroundInput | null
  /** Infographic-only: opt-in AI-designed frame when photoSource is none (env-gated). */
  aiDesignedBackground?: boolean
  /** When set, skips eligibility check (caller already validated). */
  eligibility?: RenderEligibility & { allowed: true }
  /** Preview mode - render image but do not deduct render credits. Default true. */
  chargeCredits?: boolean
  /** Override storage path (e.g. inspiration preview). Default hybrid/{renderId}.webp */
  storagePath?: string
  renderId?: string
  persistHybridRow?: boolean
  /** Spike/diagnostic - called with AI background buffer before overlay composite. */
  onInfographicAiBackground?: (buffer: Buffer) => void | Promise<void>
  /** Skip logo even when the business has logo_url. Default true. */
  showLogo?: boolean
  /** Upload the photo underlay (no overlay) and return backgroundUrl. */
  returnBackgroundUrl?: boolean
  backgroundStoragePath?: string
  /** Optional social caption stored on the render row for Library. */
  caption?: string | null
  /**
   * Recreate reference-image finalize: store the generated visual as-is.
   * Skips scene/infographic/quote overlay, scrim, CTA pill, and logo composite.
   */
  passThroughVisual?: boolean
  /** Stored on hybrid_social_renders.content for “another like this”. */
  recreateMeta?: RecreateSavedMeta | null
  /** Stored on hybrid_social_renders.content._designed. */
  designedMeta?: DesignedSavedMeta | null
  /** OpenAI image quality - TradiesPost passes high. */
  imageQuality?: 'medium' | 'high'
}

export type { RecreateSavedMeta, DesignedSavedMeta }

export type RunHybridSocialRenderSuccess = {
  ok: true
  renderId: string
  imageUrl: string
  usedFreeTrial: boolean
  format: ContentFormat
  preset: string
  photoSource: PhotoSource
  platform: ComposePlatform
  creditsCharged: number
  aiDesignedBackgroundUsed: boolean
  aiDesignedBackgroundFallback: boolean
  /** Photo underlay without overlay - used to retune text/logo without regenerating AI. */
  backgroundUrl?: string | null
}

export type RunHybridSocialRenderFailure = {
  ok: false
  error: string
  renderId?: string
}

export type RunHybridSocialRenderResult =
  | RunHybridSocialRenderSuccess
  | RunHybridSocialRenderFailure

type BusinessRow = {
  name: string | null
  brand_color: string | null
  logo_url: string | null
  social_logo_corner: string | null
  social_text_styles: unknown
  ai_agent_services: string | null
  social_default_cta: string | null
}

export async function runHybridSocialRender(
  db: SupabaseClient,
  input: RunHybridSocialRenderInput,
): Promise<RunHybridSocialRenderResult> {
  const platform: ComposePlatform = input.platform ?? 'instagram'
  const format = input.format
  const photoSource = input.photoSource
  const photoUrl =
    input.passThroughVisual
      ? (input.photoUrl?.trim() || null)
      : photoSource === 'none'
        ? null
        : (input.photoUrl?.trim() || null)

  let presetForRow: string
  let contentJson: unknown

  if (format === 'infographic') {
    const preset = input.preset ?? 'process_steps'
    presetForRow = preset
    try {
      contentJson = parseInfographicContent(preset, platform, input.content)
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Invalid infographic content',
      }
    }
  } else if (format === 'quote_card') {
    presetForRow = HYBRID_QUOTE_CARD_PRESET
    try {
      contentJson = parseQuoteCardContent(input.content)
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Invalid quote card content',
      }
    }
  } else {
    presetForRow = HYBRID_SCENE_PRESET
    try {
      contentJson = parseSceneContent(input.content)
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Invalid scene content',
      }
    }
  }

  const { data: business } = await db
    .from('businesses')
    .select(
      'name, brand_color, logo_url, social_logo_corner, social_text_styles, ai_agent_services, social_default_cta',
    )
    .eq('id', input.businessId)
    .maybeSingle()

  const biz = business as BusinessRow | null
  if (!biz) return { ok: false, error: 'Business not found' }

  let eligibility: RenderEligibility & { allowed: true }
  const { data: balanceRow } = await db
    .from('render_credits')
    .select('credits_remaining, free_trial_used')
    .eq('business_id', input.businessId)
    .maybeSingle()

  const creditsRemaining = balanceRow?.credits_remaining ?? 0
  const walletMode = isUsageWalletEnabled()
  const walletChargeKind = resolveHybridAiCharge({
    chargeCredits: input.chargeCredits,
    passThroughVisual: input.passThroughVisual,
    photoSource,
    photoUrl,
    format,
    aiDesignedBackground: input.aiDesignedBackground,
    infographicAiEnabled: isInfographicAiBackgroundEnabled(),
  })
  let walletGenerationCharged = false

  if (input.eligibility) {
    eligibility = input.eligibility
  } else if (input.chargeCredits === false || walletMode) {
    eligibility = { allowed: true, useFreeTrial: false }
  } else {
    const evaluated = evaluateRenderEligibility(
      balanceRow
        ? {
            creditsRemaining: balanceRow.credits_remaining,
            freeTrialUsed: balanceRow.free_trial_used,
          }
        : null,
    )
    if (!evaluated.allowed) {
      return { ok: false, error: 'No render credits remaining' }
    }
    eligibility = evaluated
  }

  const renderId = input.renderId ?? randomUUID()
  const persistHybridRow = input.persistHybridRow !== false
  let persistedHybridRow = false

  const caption = input.caption?.trim()
  const storedContent =
    contentJson && typeof contentJson === 'object' && !Array.isArray(contentJson)
      ? mergeDesignedMetaIntoContent(
          mergeRecreateMetaIntoContent(
            {
              ...(contentJson as Record<string, unknown>),
              ...(caption ? { caption: caption.slice(0, 2200) } : {}),
            },
            input.recreateMeta,
          ),
          input.designedMeta,
        )
      : contentJson

  if (persistHybridRow) {
    const { error: insertErr } = await db.from('hybrid_social_renders').insert({
      id: renderId,
      business_id: input.businessId,
      job_id: input.jobId?.trim() || null,
      preset: presetForRow,
      platform,
      photo_source: photoSource,
      photo_url: photoUrl,
      content: storedContent,
      status: 'processing',
      used_free_trial: eligibility.useFreeTrial,
    })

    if (insertErr) {
      console.warn('[HybridRender] hybrid_social_renders insert skipped', insertErr.message)
    } else {
      persistedHybridRow = true
    }
  }

  try {
    if (!(await isSharpAvailable())) {
      throw new Error(SHARP_UNAVAILABLE_MSG)
    }

    let photoBuffer: Buffer | null = null
    // reference_recreation Use this: save the already-composited preview. Do not overlay the logo again.
    if (input.passThroughVisual) {
      if (!photoUrl) {
        throw new Error('passThroughVisual requires photoUrl')
      }
      const photoRes = await fetch(photoUrl)
      if (!photoRes.ok) {
        throw new Error(`Could not download photo (${photoRes.status})`)
      }
      const raw = Buffer.from(await photoRes.arrayBuffer())
      const webpBuffer = await convertToWebP(raw, 1024, 85, true)
      const path =
        input.storagePath?.trim() ||
        `${input.businessId}/hybrid/${renderId}.webp`
      const { error: uploadErr } = await db.storage
        .from('social-posts')
        .upload(path, webpBuffer, { contentType: 'image/webp', upsert: true })
      if (uploadErr) throw new Error(uploadErr.message || 'Upload failed')
      const {
        data: { publicUrl },
      } = db.storage.from('social-posts').getPublicUrl(path)

      if (input.chargeCredits !== false && !walletMode) {
        await consumeRenderCredits(db, {
          businessId: input.businessId,
          renderId: persistedHybridRow ? renderId : null,
          useFreeTrial: eligibility.useFreeTrial,
          count: 1,
        })
      }

      if (persistedHybridRow) {
        await db
          .from('hybrid_social_renders')
          .update({
            status: 'completed',
            result_url: publicUrl,
            used_free_trial: Boolean(input.chargeCredits !== false && eligibility.useFreeTrial),
          })
          .eq('id', renderId)
      }

      return {
        ok: true,
        renderId,
        imageUrl: publicUrl,
        usedFreeTrial: Boolean(input.chargeCredits !== false && eligibility.useFreeTrial),
        format,
        preset: presetForRow,
        photoSource,
        platform,
        creditsCharged: input.chargeCredits !== false && !walletMode ? 1 : 0,
        aiDesignedBackgroundUsed: false,
        aiDesignedBackgroundFallback: false,
        backgroundUrl: publicUrl,
      }
    }

    if (photoUrl) {
      const photoRes = await fetch(photoUrl)
      if (!photoRes.ok) {
        throw new Error(`Could not download photo (${photoRes.status})`)
      }
      photoBuffer = Buffer.from(await photoRes.arrayBuffer())
    } else if (photoSource === 'ai_generate' || photoSource === 'custom_prompt') {
      if (walletMode && walletChargeKind === 'inline_ai_photo') {
        await consumeRenderUsage(db, {
          businessId: input.businessId,
          generationId: renderId,
          sourceType: 'hybrid_inline_ai_photo',
          sourceId: renderId,
        })
        walletGenerationCharged = true
      }
      const tradeCategory =
        input.aiBackground?.tradeCategory?.trim() ||
        inferTradeCategory({
          ai_agent_services: biz.ai_agent_services,
          name: biz.name,
        }) ||
        'general'

      photoBuffer = await generateAiPhotoBackgroundBuffer(db, {
        businessId: input.businessId,
        photoSource,
        purpose: input.aiBackground?.purpose,
        sceneId: input.aiBackground?.sceneId,
        style: input.aiBackground?.style,
        customPrompt: input.aiBackground?.customPrompt,
        tradeCategory,
        jobDescription: input.aiBackground?.jobDescription ?? null,
        extraDetail: input.aiBackground?.extraDetail ?? null,
        avoidPeople: input.aiBackground?.avoidPeople === true,
        quality: input.imageQuality,
        business: {
          name: biz.name,
          brand_color: biz.brand_color,
          ai_agent_services: biz.ai_agent_services,
          social_default_cta: biz.social_default_cta,
        },
      })
    }

    let aiDesignedBackgroundUsed = false
    let aiDesignedBackgroundFallback = false

    const wantsAiDesignedBackground =
      Boolean(input.aiDesignedBackground) &&
      format === 'infographic' &&
      photoSource === 'none' &&
      !photoBuffer

    if (wantsAiDesignedBackground) {
      if (!isInfographicAiBackgroundEnabled()) {
        aiDesignedBackgroundFallback = true
        console.log('[HybridRender][InfographicAiBg] skipped - INFOGRAPHIC_AI_BACKGROUND_ENABLED is not true')
      } else if (
        !walletMode &&
        (eligibility.useFreeTrial || !canAttemptInfographicAiBackground(creditsRemaining))
      ) {
        aiDesignedBackgroundFallback = true
        console.log('[HybridRender][InfographicAiBg] skipped - need 2 paid credits for AI frame', {
          creditsRemaining,
          useFreeTrial: eligibility.useFreeTrial,
        })
      } else {
        try {
          if (walletMode && walletChargeKind === 'infographic_ai') {
            await consumeRenderUsage(db, {
              businessId: input.businessId,
              generationId: renderId,
              sourceType: 'hybrid_infographic_ai',
              sourceId: renderId,
            })
            walletGenerationCharged = true
          }
          photoBuffer = await generateInfographicAiBackgroundBuffer({
            preset: presetForRow as InfographicPreset,
            platform,
            content: contentJson as ReturnType<typeof parseInfographicContent>,
            postSubtype:
              input.postSubtype && isPostSubtypeId(input.postSubtype)
                ? input.postSubtype
                : null,
            brandColor: biz.brand_color,
            tradeId: inferCanonicalTrade({
              ai_agent_services: biz.ai_agent_services,
              name: biz.name,
            }),
            quality: input.imageQuality,
          })
          if (input.onInfographicAiBackground) {
            await input.onInfographicAiBackground(photoBuffer)
          }
          aiDesignedBackgroundUsed = true
          console.log('[HybridRender][InfographicAiBg] success', {
            preset: presetForRow,
            platform,
          })
        } catch (err) {
          aiDesignedBackgroundFallback = true
          if (walletGenerationCharged) {
            await refundRenderUsage(db, {
              businessId: input.businessId,
              generationId: renderId,
            })
            walletGenerationCharged = false
          }
          console.warn('[HybridRender][InfographicAiBg] failed - resvg fallback', {
            preset: presetForRow,
            detail: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    const businessStyles = parseSocialTextStyles(biz.social_text_styles)
    const resolvedTextStyles = resolveSocialTextStyles({
      override: input.textStyles ?? null,
      business: businessStyles,
    })

    let photoBase: Buffer | null = null
    if (photoBuffer) {
      photoBase = await resizeHybridPhotoBackground(photoBuffer, platform)
    }

    let overlayPng: Buffer
    if (format === 'infographic') {
      overlayPng = renderInfographicOverlayPng({
        preset: presetForRow as InfographicPreset,
        platform,
        content: contentJson as ReturnType<typeof parseInfographicContent>,
        brandColor: biz.brand_color,
        transparentBackground: Boolean(photoBuffer),
        footerLabel: biz.name?.trim() || null,
        postSubtype:
          input.postSubtype && isPostSubtypeId(input.postSubtype)
            ? input.postSubtype
            : null,
        tradeId: inferCanonicalTrade({
          ai_agent_services: biz.ai_agent_services,
          name: biz.name,
        }),
      })
    } else if (format === 'quote_card') {
      overlayPng = renderQuoteCardOverlayPng({
        platform,
        content: contentJson as ReturnType<typeof parseQuoteCardContent>,
        brandColor: biz.brand_color,
        transparentBackground: Boolean(photoBuffer),
      })
    } else {
      const sceneContent = contentJson as ReturnType<typeof parseSceneContent>
      const colorExplicit = getSceneColorExplicitFlags({
        businessRaw: biz.social_text_styles,
        override: input.textStyles ?? null,
      })

      let scrimProfile: ScrimProfile | undefined
      let autoHeadlineColor: string
      let autoTaglineColor: string

      if (photoBase) {
        const layout = computeSceneLayout({
          platform,
          content: sceneContent,
          stack: resolvedTextStyles,
        })
        const contrast = await analyzeScenePhotoContrast(photoBase, layout, platform)
        scrimProfile = contrast.scrim
        autoHeadlineColor = contrast.autoHeadlineColor
        autoTaglineColor = contrast.autoTaglineColor
        console.log('[SceneContrast]', {
          ...contrast.log,
          explicitSkipped: {
            headline: colorExplicit.headline,
            tagline: colorExplicit.tagline,
          },
        })
      } else {
        const opaque = sceneOpaqueAutoColors()
        autoHeadlineColor = opaque.autoHeadlineColor
        autoTaglineColor = opaque.autoTaglineColor
        console.log('[SceneContrast]', {
          platform,
          mode: 'opaque_no_photo',
          autoHeadlineColor,
          autoTaglineColor,
          explicitSkipped: {
            headline: colorExplicit.headline,
            tagline: colorExplicit.tagline,
          },
        })
      }

      const sceneTextStyles = applySceneRenderTextColors({
        resolved: resolvedTextStyles,
        explicit: colorExplicit,
        autoHeadlineColor,
        autoTaglineColor,
      })

      overlayPng = renderSceneOverlayPng({
        platform,
        content: sceneContent,
        textStyles: sceneTextStyles,
        brandColor: biz.brand_color,
        transparentBackground: Boolean(photoBuffer),
        scrimProfile,
      })
    }

    let composed = await compositeInfographicOnPhoto({
      overlayPng,
      platform,
      photoBuffer: photoBase ? null : photoBuffer,
      photoBase,
    })

    let backgroundUrl: string | null = null
    if (input.returnBackgroundUrl && photoBase) {
      const bgPath =
        input.backgroundStoragePath?.trim() ||
        `${input.businessId}/inspiration-preview/${renderId}-bg.webp`
      const bgWebp = await convertToWebP(photoBase, 2048, 85, true)
      const { error: bgErr } = await db.storage
        .from('social-posts')
        .upload(bgPath, bgWebp, { contentType: 'image/webp', upsert: true })
      if (bgErr) {
        console.warn('[HybridRender] background upload skipped', bgErr.message)
      } else {
        backgroundUrl = db.storage.from('social-posts').getPublicUrl(bgPath).data.publicUrl
      }
    }

    const logoUrl = biz.logo_url?.trim()
    if (logoUrl && input.showLogo !== false) {
      const corner = parseSocialLogoCorner(input.logoCorner ?? biz.social_logo_corner)
      composed = await compositeLogoCorner(composed, logoUrl, { corner })
    }

    const webpBuffer = await convertToWebP(composed, 2048, 85, true)
    const path =
      input.storagePath?.trim() ||
      `${input.businessId}/hybrid/${renderId}.webp`
    const { error: uploadErr } = await db.storage
      .from('social-posts')
      .upload(path, webpBuffer, { contentType: 'image/webp', upsert: true })

    if (uploadErr) throw new Error(uploadErr.message || 'Upload failed')

    const {
      data: { publicUrl },
    } = db.storage.from('social-posts').getPublicUrl(path)

    const creditsCharged = aiDesignedBackgroundUsed
      ? INFOGRAPHIC_AI_BACKGROUND_CREDITS
      : INFOGRAPHIC_RESVG_ONLY_CREDITS

    const shouldCharge = input.chargeCredits !== false && !walletMode

    if (shouldCharge) {
      await consumeRenderCredits(db, {
        businessId: input.businessId,
        renderId: persistedHybridRow ? renderId : null,
        useFreeTrial: eligibility.useFreeTrial && creditsCharged === INFOGRAPHIC_RESVG_ONLY_CREDITS,
        count: creditsCharged,
      })
    }

    const usedFreeTrial =
      shouldCharge &&
      eligibility.useFreeTrial &&
      creditsCharged === INFOGRAPHIC_RESVG_ONLY_CREDITS

    if (persistedHybridRow) {
      await db
        .from('hybrid_social_renders')
        .update({
          status: 'completed',
          result_url: publicUrl,
          used_free_trial: usedFreeTrial,
        })
        .eq('id', renderId)
    }

    return {
      ok: true,
      renderId,
      imageUrl: publicUrl,
      usedFreeTrial,
      format,
      preset: presetForRow,
      photoSource,
      platform,
      creditsCharged: walletMode
        ? walletGenerationCharged
          ? 1
          : 0
        : shouldCharge
          ? creditsCharged
          : 0,
      aiDesignedBackgroundUsed,
      aiDesignedBackgroundFallback,
      backgroundUrl,
    }
  } catch (err) {
    if (walletGenerationCharged) {
      await refundRenderUsage(db, {
        businessId: input.businessId,
        generationId: renderId,
      })
      walletGenerationCharged = false
    }
    const message = err instanceof Error ? err.message : String(err)
    if (persistedHybridRow) {
      await db
        .from('hybrid_social_renders')
        .update({
          status: 'failed',
          error_message: message.slice(0, 500),
        })
        .eq('id', renderId)
    }
    return { ok: false, error: message, renderId }
  }
}
