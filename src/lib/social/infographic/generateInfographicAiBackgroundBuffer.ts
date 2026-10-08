/**
 * OpenAI abstract frame for hybrid infographic renders (background only - copy via resvg).
 */

import sharp from 'sharp'
import { DEFAULT_OPENAI_IMAGE_MODEL } from '@/lib/social/aiImagePrompt'
import type { ComposePlatform, InfographicPreset } from '@/lib/social/composeModel'
import {
  buildInfographicAiBackgroundPrompt,
} from '@/lib/social/infographic/buildInfographicAiBackgroundPrompt'
import {
  resolveInfographicTheme,
  type InfographicVisualThemeId,
} from '@/lib/social/infographic/infographicVisualTheme'
import { INFOGRAPHIC_PLATFORM_SIZES } from '@/lib/social/infographic/platformSizes'
import type { InfographicContent } from '@/lib/social/infographicContent'
import type { PostSubtypeId } from '@/lib/social/postTaxonomy'

export interface InfographicAiBackgroundInput {
  preset: InfographicPreset
  platform: ComposePlatform
  content: InfographicContent
  postSubtype?: PostSubtypeId | null
  brandColor?: string | null
  tradeId?: string | null
  /** Defaults to medium. TradiesPost passes high. */
  quality?: 'medium' | 'high'
}

export function resolveInfographicAiBackgroundTheme(input: {
  content: InfographicContent
  postSubtype?: PostSubtypeId | null
}): InfographicVisualThemeId {
  const fromContent =
    input.content && typeof input.content === 'object' && 'visualTheme' in input.content
      ? (input.content as { visualTheme?: InfographicVisualThemeId | null }).visualTheme
      : null

  return resolveInfographicTheme({
    visualTheme: fromContent,
    postSubtype: input.postSubtype,
  }).id
}

export async function generateInfographicAiBackgroundBuffer(
  input: InfographicAiBackgroundInput,
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const visualTheme = resolveInfographicAiBackgroundTheme({
    content: input.content,
    postSubtype: input.postSubtype,
  })

  const prompt = buildInfographicAiBackgroundPrompt({
    preset: input.preset,
    visualTheme,
    brandColor: input.brandColor,
    tradeId: input.tradeId,
  })

  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const response = await client.images.generate({
    model,
    prompt,
    size: '1024x1024',
    quality: input.quality ?? 'medium',
    output_format: 'png',
  })

  const b64 = response.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI returned no image data')

  const raw = Buffer.from(b64, 'base64')
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[input.platform]

  return sharp(raw)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer()
}
