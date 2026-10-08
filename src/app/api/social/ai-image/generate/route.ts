import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import {
  buildAiImagePrompt,
  buildCustomAiImagePrompt,
  buildServicesSnippet,
  DEFAULT_OPENAI_IMAGE_MODEL,
} from '@/lib/social/aiImagePrompt'
import { inferTradeCategory } from '@/lib/social/inferTradeCategory'
import { resolveDefaultTagline } from '@/lib/social/templateFields'
import {
  getAiImageStyle,
  MAX_AI_IMAGE_CUSTOM_PROMPT,
  MAX_AI_IMAGE_EXTRA_DETAIL,
  type AiImageMode,
} from '@/lib/social/aiImageStyles'
import { convertToWebP, compositeLogoCorner, isSharpAvailable } from '@/lib/imageProcessor'
import { parseSocialLogoCorner } from '@/lib/social/socialLogoCorner'
import {
  consumeRenderUsage,
  evaluateUsageAccess,
  insufficientUsageBody,
  InsufficientUsageError,
  paymentRequiredPayload,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { resolveSocialImageQualityForBusiness } from '@/lib/tradiespost/imageQuality'

export const runtime = 'nodejs'
export const maxDuration = 60

const VALID_PURPOSES = new Set(['job_showcase', 'promo', 'review', 'team'])

const SHARP_UNAVAILABLE_MSG = 'Image processing unavailable, please try again'
const NO_CREDITS_MSG =
  'No render credits remaining. Buy a credit pack to continue, or your free trial has already been used.'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase.from('users') as any)
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  let body: {
    purpose?:        string
    sceneId?:        string
    style?:          string
    mode?:           string
    customPrompt?:   string
    finalPrompt?:    string
    tradeCategory?:  string
    businessName?:   string | null
    jobDescription?: string | null
    brandColor?:     string | null
    extraDetail?:    string | null
    logoCorner?:     string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const modeRaw = body.mode?.trim() || 'photo'
  if (modeRaw !== 'photo' && modeRaw !== 'full_post') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }
  const mode = modeRaw as AiImageMode

  const tradeCategory = body.tradeCategory?.trim()
  if (!tradeCategory) {
    return NextResponse.json({ error: 'tradeCategory is required' }, { status: 400 })
  }

  const finalPromptRaw = (body.finalPrompt ?? body.customPrompt)?.trim() ?? ''
  const isCustomPrompt = finalPromptRaw.length > 0

  if (isCustomPrompt && finalPromptRaw.length > MAX_AI_IMAGE_CUSTOM_PROMPT) {
    return NextResponse.json(
      { error: `Prompt must be ${MAX_AI_IMAGE_CUSTOM_PROMPT} characters or fewer` },
      { status: 400 },
    )
  }

  const purpose = body.purpose?.trim()
  const sceneId = body.sceneId?.trim()
  const style = body.style?.trim()

  if (!isCustomPrompt) {
    if (!purpose || !VALID_PURPOSES.has(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
    }
    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId is required' }, { status: 400 })
    }
    if (!style) {
      return NextResponse.json({ error: 'style is required' }, { status: 400 })
    }
  }

  const db = await createServiceClient()
  const { data: biz } = await db
    .from('businesses')
    .select('name, brand_color, ai_agent_services, social_default_cta, logo_url, social_logo_corner')
    .eq('id', businessId)
    .maybeSingle()

  type BizRow = {
    name?:                 string | null
    brand_color?:          string | null
    ai_agent_services?:    string | null
    social_default_cta?:   string | null
    logo_url?:             string | null
    social_logo_corner?:   string | null
  }

  const bizRow = biz as BizRow | null

  const businessName =
    body.businessName?.trim() ||
    bizRow?.name?.trim() ||
    null

  const inferredTrade = inferTradeCategory({
    ai_agent_services: bizRow?.ai_agent_services,
    name:              bizRow?.name,
  })
  const effectiveTradeCategory = inferredTrade ?? tradeCategory

  const servicesSnippet = buildServicesSnippet({
    ai_agent_services:  bizRow?.ai_agent_services,
    social_default_cta: bizRow?.social_default_cta,
  })

  const tagline = bizRow ? resolveDefaultTagline(bizRow) : null

  const extraDetailRaw = body.extraDetail?.trim() ?? ''
  const extraDetail = extraDetailRaw
    ? extraDetailRaw.slice(0, MAX_AI_IMAGE_EXTRA_DETAIL)
    : null

  let brandColor = body.brandColor?.trim() || null
  if (!brandColor) {
    brandColor = bizRow?.brand_color?.trim() || null
  }

  const resolvedLogoCorner = parseSocialLogoCorner(
    body.logoCorner?.trim() || bizRow?.social_logo_corner,
  )

  let prompt: string

  if (isCustomPrompt) {
    prompt = buildCustomAiImagePrompt(
      {
        customPrompt:   finalPromptRaw.slice(0, MAX_AI_IMAGE_CUSTOM_PROMPT),
        tradeCategory:  effectiveTradeCategory,
        businessName,
        servicesSnippet,
        jobDescription: body.jobDescription,
        brandColor,
      },
      mode,
    )
  } else {
    const styleOption = getAiImageStyle(style!)
    if (!styleOption) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
    }

    const { data: scene, error: sceneErr } = await supabase
      .from('ai_image_scene_options')
      .select('id, purpose, scene_prompt_fragment')
      .eq('id', sceneId!)
      .maybeSingle()

    if (sceneErr || !scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }
    if (scene.purpose !== purpose) {
      return NextResponse.json({ error: 'Scene does not match purpose' }, { status: 400 })
    }

    prompt = buildAiImagePrompt(
      {
        styleFragment:   styleOption.promptFragment,
        sceneFragment:   scene.scene_prompt_fragment,
        tradeCategory:   effectiveTradeCategory,
        businessName,
        servicesSnippet,
        tagline,
        jobDescription: body.jobDescription,
        brandColor,
        extraDetail,
      },
      mode,
    )
  }

  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL

  const access = await evaluateUsageAccess(db, businessId)
  if (!access.allowed) {
    const denied = paymentRequiredPayload(access)
    return NextResponse.json(denied.body, { status: denied.status })
  }
  let consumeMode: 'paid' | 'free_trial' = access.accounting === 'legacy' && access.useFreeTrial
    ? 'free_trial'
    : 'paid'
  const generationId = randomUUID()

  console.log('[AiImage/generate]', {
    businessId,
    purpose:            purpose ?? null,
    sceneId:            sceneId ?? null,
    style:              style ?? null,
    isCustomPrompt,
    finalPromptLength: isCustomPrompt ? finalPromptRaw.length : null,
    mode,
    tradeCategory,
    effectiveTradeCategory,
    model,
    promptLength: prompt.length,
    hasServicesSnippet: Boolean(servicesSnippet),
    useFreeTrial: consumeMode === 'free_trial',
  })

  const walletMode = isUsageWalletEnabled()
  try {
    if (!(await isSharpAvailable())) {
      console.error('[AiImage/generate]', SHARP_UNAVAILABLE_MSG)
      return NextResponse.json({ error: SHARP_UNAVAILABLE_MSG }, { status: 503 })
    }

    if (walletMode) {
      const consumed = await consumeRenderUsage(db, {
        businessId,
        generationId,
        sourceType: 'ai_photo',
        sourceId: generationId,
        useFreeTrial: consumeMode === 'free_trial',
      })
      consumeMode = consumed.chargeSource === 'free_trial' ? 'free_trial' : 'paid'
    }

    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const imageQuality = await resolveSocialImageQualityForBusiness(db, businessId)

    const response = await client.images.generate({
      model,
      prompt,
      size:          '1024x1024',
      quality:       imageQuality,
      output_format: 'webp',
    })

    const b64 = response.data?.[0]?.b64_json
    const { recordImageGenerationUsage } = await import('@/lib/aiUsage/recordImageUsage')
    await recordImageGenerationUsage({
      ctx: {
        businessId,
        feature: 'social_image',
        customerCreditsCharged: consumeMode === 'free_trial' ? 0 : 1,
      },
      model,
      usage: (response as { usage?: { input_tokens?: number; output_tokens?: number; input_tokens_details?: { image_tokens?: number; text_tokens?: number } } }).usage ?? null,
      status: b64 ? 'success' : 'failed',
      size: '1024x1024',
      quality: imageQuality,
      errorCode: b64 ? undefined : 'empty_image',
    })
    if (!b64) {
      if (walletMode) {
        await refundRenderUsage(db, { businessId, generationId, consumedMode: consumeMode })
      }
      return NextResponse.json({ error: 'OpenAI returned no image data' }, { status: 502 })
    }

    const rawBuffer = Buffer.from(b64, 'base64')
    let webpBuffer = await convertToWebP(rawBuffer, 2048, 85, true)

    if (mode === 'full_post') {
      const logoUrl = bizRow?.logo_url?.trim()
      if (logoUrl) {
        webpBuffer = await compositeLogoCorner(webpBuffer, logoUrl, {
          corner: resolvedLogoCorner,
        })
        console.log('[AiImage/generate] Logo composited', {
          businessId,
          hasLogo: true,
          logoCorner: resolvedLogoCorner,
        })
      }
    }

    console.log('[AiImage/generate] Buffer sizes', {
      rawBufferLength:  rawBuffer.length,
      webpBufferLength: webpBuffer.length,
    })

    const path = `${businessId}/ai/${Date.now()}.webp`

    const storage = await createServiceClient()
    const { error: uploadErr } = await storage.storage
      .from('social-posts')
      .upload(path, webpBuffer, { contentType: 'image/webp', upsert: false })

    if (uploadErr) {
      console.error('[AiImage/generate] Upload failed', uploadErr.message)
      if (walletMode) {
        await refundRenderUsage(db, { businessId, generationId, consumedMode: consumeMode })
      }
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = storage.storage.from('social-posts').getPublicUrl(path)

    if (!walletMode) {
      await consumeRenderUsage(db, {
        businessId,
        generationId,
        sourceType: 'ai_photo',
        sourceId: generationId,
        useFreeTrial: consumeMode === 'free_trial',
        legacyNullRenderId: true,
      })
    }

    return NextResponse.json({
      url: publicUrl,
      mode,
      usedFreeTrial: consumeMode === 'free_trial',
      ...(mode === 'full_post' && bizRow?.logo_url?.trim() && {
        logoCorner: resolvedLogoCorner,
      }),
    })
  } catch (err) {
    if (err instanceof InsufficientUsageError) {
      return NextResponse.json(insufficientUsageBody(err), { status: 402 })
    }
    if (walletMode) {
      await refundRenderUsage(db, { businessId, generationId, consumedMode: consumeMode })
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error('[AiImage/generate]', message)
    return NextResponse.json({ error: message || 'Image generation failed' }, { status: 502 })
  }
}
