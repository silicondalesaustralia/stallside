/**
 * POST /api/social/hybrid-render
 * Infographic or scene SVG (resvg) ± photo underlay ± logo; 1-2 render credits on success.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { loadSuggestionForBusiness } from '@/lib/agent/agentSuggestionAuth'
import { markSuggestionExecuted } from '@/lib/agent/executeAgentSuggestion'
import {
  COMPOSE_PLATFORMS,
  isContentFormat,
  isInfographicPreset,
  isPhotoSource,
  type ComposePlatform,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import { parseInfographicContent } from '@/lib/social/infographicContent'
import { parseSceneContent } from '@/lib/social/sceneContent'
import { parseQuoteCardContent } from '@/lib/social/quoteCardContent'
import type { PostSubtypeId } from '@/lib/social/postTaxonomy'
import { isPostSubtypeId } from '@/lib/social/postTaxonomy'
import type { PartialSocialTextStyles } from '@/lib/social/socialTextStyle'
import { evaluateRenderEligibility } from '@/lib/renders/consumeRenderCredit'
import { evaluateUsageAccess, paymentRequiredPayload } from '@/lib/billing/usageAccounting'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { resolveSocialImageQualityForBusiness } from '@/lib/tradiespost/imageQuality'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { resolveHybridAiCharge } from '@/lib/social/hybridRenderCharge'
import {
  runHybridSocialRender,
  SHARP_UNAVAILABLE_MSG,
} from '@/lib/social/runHybridSocialRender'
import { isInfographicAiBackgroundEnabled } from '@/lib/social/infographic/infographicAiBackgroundFeature'
import { logRecreateAnalytics } from '@/lib/social/recreateAnalytics'
import { logDesignedAnalytics } from '@/lib/social/designedAnalytics'
import { buildDesignedLibraryMeta } from '@/lib/social/designedFinalize'
import { isHttpsPhotoUrl, resolveOwnedComposePhotoUrl } from '@/lib/social/resolveComposePhoto'

export const runtime = 'nodejs'
export const maxDuration = 60

const NO_CREDITS_MSG =
  'No render credits remaining. Buy a credit pack to continue, or your free trial has already been used.'

type AiBackgroundBody = {
  purpose?:        string
  sceneId?:        string
  style?:          string
  customPrompt?:   string
  tradeCategory?:  string
  jobDescription?: string | null
  extraDetail?:    string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    format?:              string
    preset?:              string
    platform?:            string
    photoSource?:         string
    photoUrl?:            string | null
    photoStoragePath?:    string | null
    content?:             unknown
    jobId?:               string
    logoCorner?:          string
    textStyles?:          PartialSocialTextStyles
    aiBackground?:        AiBackgroundBody
    aiDesignedBackground?: boolean
    postSubtype?:         string
    agentSuggestionId?:   string
    showLogo?:            boolean
    passThroughVisual?:   boolean
    recreateMeta?: {
      recreateMode?: string | null
      messageAngle?: string | null
      campaignFocus?: string | null
      visualPath?: string | null
      imageModel?: string | null
      logoAssetId?: string | null
      logoVariantType?: string | null
      logoDisabled?: boolean
      logoPosition?: string | null
      logoSize?: string | null
    }
    designedMeta?: {
      messageAngle?: string | null
      userBrief?: string | null
      intentChip?: string | null
      jobId?: string | null
      visualPath?: string | null
      imageModel?: string | null
      logoAssetId?: string | null
      logoVariantType?: string | null
      logoDisabled?: boolean
      logoPosition?: string | null
      logoSize?: string | null
      visualInputs?: unknown
    }
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const formatRaw = (body.format?.trim() || 'infographic') as ContentFormat
  if (!isContentFormat(formatRaw)) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }
  const format = formatRaw

  const platformRaw = (body.platform?.trim() || 'instagram') as ComposePlatform
  if (!COMPOSE_PLATFORMS.includes(platformRaw)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }
  const platform = platformRaw

  const photoSourceRaw = (body.photoSource?.trim() || 'none') as PhotoSource
  if (!isPhotoSource(photoSourceRaw)) {
    return NextResponse.json({ error: 'Invalid photoSource' }, { status: 400 })
  }
  const photoSource = photoSourceRaw

  let photoUrl =
    body.passThroughVisual === true
      ? (body.photoUrl?.trim() || null)
      : photoSource === 'none'
        ? null
        : (body.photoUrl?.trim() || null)
  const photoStoragePath =
    typeof body.photoStoragePath === 'string' ? body.photoStoragePath.trim() : ''

  let presetForRow: string
  let contentJson: unknown

  if (format === 'infographic') {
    const presetRaw = body.preset?.trim() ?? ''
    if (!isInfographicPreset(presetRaw)) {
      return NextResponse.json({ error: 'Invalid preset' }, { status: 400 })
    }
    presetForRow = presetRaw
    try {
      contentJson = parseInfographicContent(presetRaw as InfographicPreset, platform, body.content)
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Invalid content for preset',
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 400 },
      )
    }
  } else if (format === 'quote_card') {
    presetForRow = 'quote_card'
    try {
      contentJson = parseQuoteCardContent(body.content)
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Invalid quote card content',
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 400 },
      )
    }
  } else {
    presetForRow = 'scene'
    try {
      contentJson = parseSceneContent(body.content)
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Invalid scene content',
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 400 },
      )
    }
  }

  const passThroughVisual = body.passThroughVisual === true
  if (passThroughVisual && (!photoUrl || !photoUrl.startsWith('https://'))) {
    return NextResponse.json(
      { error: 'passThroughVisual requires an HTTPS photoUrl' },
      { status: 400 },
    )
  }

  const needsPhotoUrl =
    photoSource !== 'none' &&
    photoSource !== 'ai_generate' &&
    photoSource !== 'custom_prompt'

  if (needsPhotoUrl && !isHttpsPhotoUrl(photoUrl) && !photoStoragePath) {
    return NextResponse.json(
      { error: 'photoUrl (HTTPS) or photoStoragePath is required when photo source is not "none"' },
      { status: 400 },
    )
  }

  if (
    photoSource === 'ai_generate' &&
    !photoUrl &&
    !body.aiBackground?.sceneId
  ) {
    return NextResponse.json(
      { error: 'photoUrl or aiBackground (purpose, sceneId, style) required' },
      { status: 400 },
    )
  }

  if (
    photoSource === 'custom_prompt' &&
    !photoUrl &&
    !body.aiBackground?.customPrompt?.trim()
  ) {
    return NextResponse.json(
      { error: 'photoUrl or aiBackground.customPrompt required' },
      { status: 400 },
    )
  }

  const aiDesignedBackground = body.aiDesignedBackground === true

  if (aiDesignedBackground) {
    if (format !== 'infographic') {
      return NextResponse.json(
        { error: 'aiDesignedBackground is only supported for infographic format' },
        { status: 400 },
      )
    }
    if (photoSource !== 'none') {
      return NextResponse.json(
        { error: 'aiDesignedBackground requires photoSource "none"' },
        { status: 400 },
      )
    }
    if (!isInfographicAiBackgroundEnabled()) {
      return NextResponse.json(
        { error: 'AI-designed infographic backgrounds are not enabled on this deployment' },
        { status: 403 },
      )
    }
  }

  const db = await createServiceClient()
  const { data: userData } = await db
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  if (photoStoragePath) {
    const resolved = await resolveOwnedComposePhotoUrl(db, businessId, photoStoragePath)
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }
    photoUrl = resolved.url
  }

  const jobId = body.jobId?.trim() || null
  if (jobId) {
    const { data: job } = await db
      .from('jobs')
      .select('id, business_id')
      .eq('id', jobId)
      .maybeSingle()
    if (!job || job.business_id !== businessId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
  }

  const { data: balanceRow } = await db
    .from('render_credits')
    .select('credits_remaining, free_trial_used')
    .eq('business_id', businessId)
    .maybeSingle()

  const eligibility = evaluateRenderEligibility(
    balanceRow
      ? {
          creditsRemaining: balanceRow.credits_remaining,
          freeTrialUsed: balanceRow.free_trial_used,
        }
      : null,
  )

  const walletChargeKind = resolveHybridAiCharge({
    chargeCredits: !passThroughVisual,
    passThroughVisual,
    photoSource,
    photoUrl,
    format,
    aiDesignedBackground,
    infographicAiEnabled: isInfographicAiBackgroundEnabled(),
  })

  // passThroughVisual / deterministic composite: do not require credits when wallet mode is on.
  if (isUsageWalletEnabled()) {
    if (!passThroughVisual && walletChargeKind !== 'none') {
      const access = await evaluateUsageAccess(db, businessId)
      if (!access.allowed) {
        const denied = paymentRequiredPayload(access)
        return NextResponse.json(denied.body, { status: denied.status })
      }
    }
  } else if (!passThroughVisual && !eligibility.allowed) {
    return NextResponse.json(
      { error: NO_CREDITS_MSG, code: 'no_render_credits' },
      { status: 402 },
    )
  }

  const passThroughEligibility = { allowed: true as const, useFreeTrial: false }

  console.log('[HybridRender] start', {
    businessId,
    format,
    preset: presetForRow,
    platform,
    photoSource,
    aiDesignedBackground,
    useFreeTrial: passThroughVisual ? false : eligibility.allowed && eligibility.useFreeTrial,
    passThroughVisual,
    chargeCredits: !passThroughVisual,
    agentSuggestionId: body.agentSuggestionId?.trim() || null,
  })

  const imageQuality = await resolveSocialImageQualityForBusiness(db, businessId)

  const result = await runHybridSocialRender(db, {
    businessId,
    jobId,
    format,
    platform,
    photoSource,
    photoUrl,
    preset: format === 'infographic' ? (presetForRow as InfographicPreset) : undefined,
    content: contentJson,
    postSubtype:
      body.postSubtype && isPostSubtypeId(body.postSubtype)
        ? (body.postSubtype as PostSubtypeId)
        : null,
    logoCorner: body.logoCorner ?? null,
    textStyles: body.textStyles ?? null,
    showLogo: body.showLogo !== false,
    passThroughVisual,
    chargeCredits: passThroughVisual ? false : undefined,
    eligibility: passThroughVisual
      ? passThroughEligibility
      : eligibility.allowed
        ? eligibility
        : passThroughEligibility,
    recreateMeta: body.recreateMeta
      ? {
          recreateMode: body.recreateMeta.recreateMode ?? null,
          messageAngle: body.recreateMeta.messageAngle ?? null,
          campaignFocus: body.recreateMeta.campaignFocus ?? null,
          visualPath: body.recreateMeta.visualPath ?? 'reference_recreation',
          imageModel: body.recreateMeta.imageModel ?? null,
          generationSource: 'recreate_reference',
          logoAssetId: body.recreateMeta.logoAssetId ?? null,
          logoVariantType: body.recreateMeta.logoVariantType ?? null,
          logoDisabled: body.recreateMeta.logoDisabled === true,
          logoPosition: body.recreateMeta.logoPosition ?? null,
          logoSize: body.recreateMeta.logoSize ?? null,
        }
      : null,
    designedMeta: body.designedMeta
      ? buildDesignedLibraryMeta({
          messageAngle: body.designedMeta.messageAngle ?? null,
          userBrief: body.designedMeta.userBrief ?? null,
          intentChip: body.designedMeta.intentChip ?? null,
          jobId: body.designedMeta.jobId ?? null,
          imageModel: body.designedMeta.imageModel ?? null,
          logoAssetId: body.designedMeta.logoAssetId ?? null,
          logoVariantType: body.designedMeta.logoVariantType ?? null,
          logoDisabled: body.designedMeta.logoDisabled === true,
          logoPosition: body.designedMeta.logoPosition ?? null,
          logoSize: body.designedMeta.logoSize ?? null,
          visualInputs: body.designedMeta.visualInputs,
        })
      : null,
    aiBackground: body.aiBackground ?? null,
    aiDesignedBackground,
    imageQuality,
  })

  if (!result.ok) {
    if (result.error?.includes('enough usage credit')) {
      return NextResponse.json(
        { error: result.error, code: 'insufficient_usage_balance', renderId: result.renderId },
        { status: 402 },
      )
    }
    const status = result.error === SHARP_UNAVAILABLE_MSG ? 503 : 502
    return NextResponse.json(
      { error: result.error || 'Render failed', renderId: result.renderId },
      { status },
    )
  }

  const agentSuggestionId = body.agentSuggestionId?.trim()
  if (agentSuggestionId) {
    try {
      const suggestion = await loadSuggestionForBusiness(businessId, agentSuggestionId)
      if (
        suggestion &&
        suggestion.status === 'pending' &&
        suggestion.type === 'social_post'
      ) {
        await markSuggestionExecuted(db, suggestion.id, suggestion.draft_content, {
          execution_path: 'customized',
          render_id: result.renderId,
          image_url: result.imageUrl,
          used_free_trial: result.usedFreeTrial,
          format: result.format,
          photo_source: result.photoSource,
        })
      }
    } catch (err) {
      console.error('[HybridRender] agent suggestion completion failed', err)
    }
  }

  if (passThroughVisual && body.recreateMeta) {
    logRecreateAnalytics('recreate_saved', {
      recreateMode: body.recreateMeta.recreateMode ?? null,
      messageAngle: body.recreateMeta.messageAngle ?? null,
      visualPath: body.recreateMeta.visualPath ?? 'reference_recreation',
      hadCampaignFocus: Boolean(body.recreateMeta.campaignFocus),
    })
  }

  if (passThroughVisual && body.designedMeta) {
    logDesignedAnalytics('ai_designed_saved', {
      messageAngle: body.designedMeta.messageAngle ?? null,
      hadUserBrief: Boolean(body.designedMeta.userBrief),
      intentChip: body.designedMeta.intentChip ?? null,
      logoVariantType: body.designedMeta.logoVariantType ?? null,
      logoPosition: body.designedMeta.logoPosition ?? null,
      logoSize: body.designedMeta.logoSize ?? null,
      logoDisabled: body.designedMeta.logoDisabled === true,
    })
  }

  console.log('[HybridRender] Completed', {
    businessId,
    renderId: result.renderId,
    format,
    resultUrl: result.imageUrl,
    usedFreeTrial: result.usedFreeTrial,
    creditsCharged: result.creditsCharged,
    passThroughVisual,
    aiDesignedBackgroundUsed: result.aiDesignedBackgroundUsed,
    aiDesignedBackgroundFallback: result.aiDesignedBackgroundFallback,
  })

  return NextResponse.json({
    id: result.renderId,
    status: 'completed',
    imageUrl: result.imageUrl,
    resultUrl: result.imageUrl,
    format: result.format,
    preset: result.preset,
    platform: result.platform,
    photoSource: result.photoSource,
    usedFreeTrial: result.usedFreeTrial,
    creditsCharged: result.creditsCharged,
    aiDesignedBackgroundUsed: result.aiDesignedBackgroundUsed,
    aiDesignedBackgroundFallback: result.aiDesignedBackgroundFallback,
  })
}
