/**
 * Recreate-from-inspiration image generation - gpt-image-2 images.edit with the
 * actual reference screenshot. Isolated from generateAiPhotoBackground.
 */

import OpenAI, { toFile } from 'openai'
import { convertToWebP, isSharpAvailable } from '@/lib/imageProcessor'
import { INSPIRATION_MAX_BYTES } from '@/lib/social/inspirationTempStorage'
import { isAllowedInspirationMime } from '@/lib/social/inspirationUploadMime'
import {
  DEFAULT_OPENAI_RECREATE_IMAGE_MODEL,
  resolveOpenAiRecreateImageModel,
} from '@/lib/social/recreateImageConfig'
import {
  buildRecreateImagePrompt,
  type RecreateBusinessContext,
  type RecreateVariantMessaging,
} from '@/lib/social/recreateImagePrompt'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import type { RecreateMode } from '@/lib/social/recreateModes'
import type { AiUsageContext } from '@/lib/aiUsage/features'
import { recordImageGenerationUsage } from '@/lib/aiUsage/recordImageUsage'

export const RECREATE_IMAGE_SIZE = '1024x1024' as const
export const RECREATE_IMAGE_QUALITY = 'medium' as const

export type RecreateImageQuality = 'medium' | 'high'

export type RecreateImageUsage = {
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  input_tokens_details?: { image_tokens?: number; text_tokens?: number }
}

export type GenerateRecreateImageInput = {
  referenceBuffer: Buffer
  referenceMimeType: string
  business: RecreateBusinessContext
  hints: InspirationGenerationHints
  messaging: RecreateVariantMessaging
  recreateMode: RecreateMode
  campaignFocus?: string | null
  applyRealLogo?: boolean
  /** Defaults to RECREATE_IMAGE_QUALITY (medium). TradiesPost passes high. */
  quality?: RecreateImageQuality
  usageContext?: AiUsageContext
}

export type GenerateRecreateImageSuccess = {
  buffer: Buffer
  model: string
  apiMethod: 'images.edit'
  durationMs: number
  usage: RecreateImageUsage | null
  estimatedUsd: number | null
  outputBytes: number
}

export class RecreateImageError extends Error {
  readonly code:
    | 'missing_image'
    | 'unsupported_mime'
    | 'image_too_large'
    | 'openai_4xx'
    | 'openai_5xx'
    | 'timeout'
    | 'malformed_output'
    | 'conversion_failed'
    | 'unknown'

  constructor(code: RecreateImageError['code'], message: string) {
    super(message)
    this.name = 'RecreateImageError'
    this.code = code
  }
}

export function filenameForRecreateReference(mimeType: string): string {
  const mime = mimeType.trim().toLowerCase()
  if (mime.includes('png')) return 'reference.png'
  if (mime.includes('webp')) return 'reference.webp'
  return 'reference.jpg'
}

export function decodeEditImageB64(response: {
  data?: Array<{ b64_json?: string | null } | null> | null
}): string {
  const b64 = response.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') {
    throw new RecreateImageError('malformed_output', 'OpenAI returned no image data')
  }
  return b64
}

export function estimateRecreateImageUsd(
  model: string,
  usage: RecreateImageUsage | null,
): number | null {
  if (!usage) return null
  const textIn = usage.input_tokens_details?.text_tokens ?? 0
  const imageIn = usage.input_tokens_details?.image_tokens ?? 0
  const out = usage.output_tokens ?? 0
  const rates = model.startsWith('gpt-image-2')
    ? { textIn: 5, imageIn: 8, out: 30 }
    : { textIn: 5, imageIn: 10, out: 40 }
  return (textIn * rates.textIn + imageIn * rates.imageIn + out * rates.out) / 1_000_000
}

function classifyOpenAiError(err: unknown): RecreateImageError {
  if (err instanceof RecreateImageError) return err
  const message = err instanceof Error ? err.message : String(err)
  const status =
    typeof err === 'object' && err && 'status' in err
      ? Number((err as { status?: number }).status)
      : NaN
  if (/timeout|ETIMEDOUT|timed out/i.test(message) || status === 408) {
    return new RecreateImageError('timeout', message)
  }
  if (status >= 500) return new RecreateImageError('openai_5xx', message)
  if (status >= 400) return new RecreateImageError('openai_4xx', message)
  if (/400|401|403|404|429/.test(message)) {
    return new RecreateImageError('openai_4xx', message)
  }
  if (/500|502|503|504/.test(message)) {
    return new RecreateImageError('openai_5xx', message)
  }
  return new RecreateImageError('unknown', message)
}

export function validateRecreateReferenceImage(
  buffer: Buffer,
  mimeType: string,
): void {
  if (!buffer?.length) {
    throw new RecreateImageError('missing_image', 'Reference screenshot is missing')
  }
  if (!isAllowedInspirationMime(mimeType)) {
    throw new RecreateImageError(
      'unsupported_mime',
      'Upload an image file (PNG, JPG, or WebP)',
    )
  }
  if (buffer.length > INSPIRATION_MAX_BYTES) {
    throw new RecreateImageError('image_too_large', 'Image too large (max 4 MB)')
  }
}

type EditClient = {
  images: {
    edit: (body: {
      model: string
      image: Awaited<ReturnType<typeof toFile>>
      prompt: string
      size: typeof RECREATE_IMAGE_SIZE
      quality: typeof RECREATE_IMAGE_QUALITY | 'high'
      output_format: 'webp' | 'png'
    }) => Promise<{
      data?: Array<{ b64_json?: string | null } | null> | null
      usage?: RecreateImageUsage | null
    }>
  }
}

export async function generateRecreateImage(
  input: GenerateRecreateImageInput,
  deps?: {
    client?: EditClient
    convert?: (buffer: Buffer) => Promise<Buffer>
  },
): Promise<GenerateRecreateImageSuccess> {
  validateRecreateReferenceImage(input.referenceBuffer, input.referenceMimeType)

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey && !deps?.client) {
    throw new RecreateImageError('unknown', 'OPENAI_API_KEY is not configured')
  }

  const model = resolveOpenAiRecreateImageModel()
  const quality = input.quality ?? RECREATE_IMAGE_QUALITY
  const prompt = buildRecreateImagePrompt({
    business: input.business,
    hints: input.hints,
    messaging: input.messaging,
    recreateMode: input.recreateMode,
    campaignFocus: input.campaignFocus,
    applyRealLogo: input.applyRealLogo === true,
  })

  const client = deps?.client ?? (new OpenAI({ apiKey }) as unknown as EditClient)
  const filename = filenameForRecreateReference(input.referenceMimeType)
  const image = await toFile(input.referenceBuffer, filename, {
    type: input.referenceMimeType,
  })

  const started = Date.now()
  let raw: Buffer
  let usage: RecreateImageUsage | null = null

  try {
    let response: Awaited<ReturnType<EditClient['images']['edit']>>
    try {
      response = await client.images.edit({
        model,
        image,
        prompt,
        size: RECREATE_IMAGE_SIZE,
        quality,
        output_format: 'webp',
      })
    } catch (firstErr) {
      const classified = classifyOpenAiError(firstErr)
      if (classified.code === 'openai_4xx' && /output_format|webp/i.test(classified.message)) {
        response = await client.images.edit({
          model,
          image,
          prompt,
          size: RECREATE_IMAGE_SIZE,
          quality,
          output_format: 'png',
        })
      } else {
        throw classified
      }
    }
    usage = response.usage ?? null
    raw = Buffer.from(decodeEditImageB64(response), 'base64')
    await recordImageGenerationUsage({
      ctx: input.usageContext ?? { feature: 'social_recreate', customerCreditsCharged: 0 },
      model,
      usage,
      status: 'success',
      size: RECREATE_IMAGE_SIZE,
      quality,
    })
  } catch (err) {
    const classified = classifyOpenAiError(err)
    await recordImageGenerationUsage({
      ctx: input.usageContext ?? { feature: 'social_recreate', customerCreditsCharged: 0 },
      model,
      usage,
      status: 'failed',
      size: RECREATE_IMAGE_SIZE,
      quality,
      errorCode: classified.code,
    })
    throw classified
  }

  const durationMs = Date.now() - started

  let buffer: Buffer
  try {
    if (deps?.convert) {
      buffer = await deps.convert(raw)
    } else {
      if (!(await isSharpAvailable())) {
        throw new RecreateImageError(
          'conversion_failed',
          'Image processing unavailable, please try again',
        )
      }
      buffer = await convertToWebP(raw, 1024, 85, true)
    }
  } catch (err) {
    if (err instanceof RecreateImageError) throw err
    throw new RecreateImageError(
      'conversion_failed',
      err instanceof Error ? err.message : 'Failed to convert Recreate image',
    )
  }

  return {
    buffer,
    model: model || DEFAULT_OPENAI_RECREATE_IMAGE_MODEL,
    apiMethod: 'images.edit',
    durationMs,
    usage,
    estimatedUsd: estimateRecreateImageUsd(model, usage),
    outputBytes: buffer.length,
  }
}
