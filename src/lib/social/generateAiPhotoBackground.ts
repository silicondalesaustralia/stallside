/**
 * OpenAI photo-mode background (no text/logo) for hybrid scene renders.
 */

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
} from '@/lib/social/aiImageStyles'
import type { createServiceClient } from '@/lib/supabase/server'
import { recordImageGenerationUsage } from '@/lib/aiUsage/recordImageUsage'

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>

const VALID_PURPOSES = new Set(['job_showcase', 'promo', 'review', 'team'])

export interface AiPhotoBackgroundInput {
  photoSource: 'ai_generate' | 'custom_prompt'
  /** Preset AI path */
  purpose?:     string
  sceneId?:     string
  style?:       string
  customPrompt?: string
  tradeCategory?: string
  jobDescription?: string | null
  extraDetail?:  string | null
  /** Inspiration / promo stills: tools and job context, not portraits. */
  avoidPeople?:  boolean
  /** Defaults to medium. TradiesPost passes high. */
  quality?:      'medium' | 'high'
  businessId?: string | null
  business: {
    name?:                 string | null
    brand_color?:          string | null
    ai_agent_services?:    string | null
    social_default_cta?:   string | null
  }
}

export async function generateAiPhotoBackgroundBuffer(
  db: ServiceClient,
  input: AiPhotoBackgroundInput,
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const inferredTrade = inferTradeCategory({
    ai_agent_services: input.business.ai_agent_services,
    name:              input.business.name,
  })
  const tradeCategory = input.tradeCategory?.trim() || inferredTrade || 'general'
  const servicesSnippet = buildServicesSnippet(input.business, 100)
  const tagline = resolveDefaultTagline(input.business)
  const brandColor = input.business.brand_color?.trim() || null

  let prompt: string

  if (input.photoSource === 'custom_prompt') {
    const customPrompt = input.customPrompt?.trim() ?? ''
    if (!customPrompt) {
      throw new Error('customPrompt is required for custom_prompt photo source')
    }
    if (customPrompt.length > MAX_AI_IMAGE_CUSTOM_PROMPT) {
      throw new Error(`Prompt must be ${MAX_AI_IMAGE_CUSTOM_PROMPT} characters or fewer`)
    }
    prompt = buildCustomAiImagePrompt(
      {
        customPrompt,
        tradeCategory,
        businessName:   input.business.name,
        servicesSnippet,
        jobDescription: input.jobDescription,
        brandColor,
      },
      'photo',
    )
  } else {
    const purpose = input.purpose?.trim()
    const sceneId = input.sceneId?.trim()
    const style = input.style?.trim()
    if (!purpose || !VALID_PURPOSES.has(purpose)) {
      throw new Error('Invalid purpose for AI background')
    }
    if (!sceneId) throw new Error('sceneId is required for AI background')
    if (!style) throw new Error('style is required for AI background')

    const styleOption = getAiImageStyle(style)
    if (!styleOption) throw new Error('Invalid style for AI background')

    const { data: scene, error: sceneErr } = await db
      .from('ai_image_scene_options')
      .select('id, purpose, scene_prompt_fragment')
      .eq('id', sceneId)
      .maybeSingle()

    if (sceneErr || !scene) throw new Error('Scene not found')
    if (scene.purpose !== purpose) throw new Error('Scene does not match purpose')

    const extraDetailRaw = input.extraDetail?.trim() ?? ''
    const extraDetail = extraDetailRaw
      ? extraDetailRaw.slice(0, MAX_AI_IMAGE_EXTRA_DETAIL)
      : null

    prompt = buildAiImagePrompt(
      {
        styleFragment:  styleOption.promptFragment,
        sceneFragment:  scene.scene_prompt_fragment,
        tradeCategory,
        businessName:   input.business.name,
        servicesSnippet,
        tagline,
        jobDescription: input.jobDescription,
        brandColor,
        extraDetail,
      },
      'photo',
    )
  }

  if (input.avoidPeople) {
    prompt = `${prompt} No people, no faces, no portraits, no one looking at the camera. Show the food, produce or goods themselves - on a stall table, in a country kitchen, at a farmers market, or in the garden or paddock they came from - in an Australian setting.`
  }

  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  try {
    const response = await client.images.generate({
      model,
      prompt,
      size:          '1024x1024',
      quality:       input.quality ?? 'medium',
      output_format: 'webp',
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI returned no image data')

    await recordImageGenerationUsage({
      ctx: {
        businessId: input.businessId,
        feature: 'social_image',
        customerCreditsCharged: 0,
      },
      model,
      usage: (response as { usage?: RecreateLikeUsage }).usage ?? null,
      status: 'success',
      size: '1024x1024',
      quality: input.quality ?? 'medium',
    })

    return Buffer.from(b64, 'base64')
  } catch (err) {
    await recordImageGenerationUsage({
      ctx: {
        businessId: input.businessId,
        feature: 'social_image',
        customerCreditsCharged: 0,
      },
      model,
      usage: null,
      status: 'failed',
      errorCode: 'image_failed',
    })
    throw err
  }
}

type RecreateLikeUsage = {
  input_tokens?: number
  output_tokens?: number
  input_tokens_details?: { image_tokens?: number; text_tokens?: number }
}
