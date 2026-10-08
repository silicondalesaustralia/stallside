/**
 * AI Designed image generation — gpt-image-2 images.generate when no visuals
 * are attached; images.edit (same Recreate reference-image path) when they are.
 */

import OpenAI, { toFile } from 'openai'
import { convertToWebP, isSharpAvailable } from '@/lib/imageProcessor'
import {
  DEFAULT_OPENAI_AI_DESIGNED_IMAGE_MODEL,
  resolveOpenAiAiDesignedImageModel,
} from '@/lib/social/aiDesignedConfig'
import {
  buildDesignedImagePrompt,
  type DesignedJobContext,
} from '@/lib/social/designedImagePrompt'
import {
  orderDesignedVisualsForProvider,
  type DesignedResolvedVisual,
} from '@/lib/social/designedVisualInputs'
import type { RecreateBusinessContext } from '@/lib/social/recreateImagePrompt'
import type { RecreateMessageAngle } from '@/lib/social/recreateMessageAngles'
import type { AiDesignedIntentId } from '@/lib/social/designedIntents'
import {
  decodeEditImageB64,
  estimateRecreateImageUsd,
  filenameForRecreateReference,
  RecreateImageError,
  validateRecreateReferenceImage,
  type RecreateImageUsage,
} from '@/lib/social/generateRecreateImage'
import type { AiUsageContext } from '@/lib/aiUsage/features'
import { recordImageGenerationUsage } from '@/lib/aiUsage/recordImageUsage'

export const DESIGNED_IMAGE_SIZE = '1024x1024' as const
export const DESIGNED_IMAGE_QUALITY = 'medium' as const

export type DesignedImageQuality = 'medium' | 'high'

export type GenerateDesignedImageInput = {
  business: RecreateBusinessContext
  messageAngle: RecreateMessageAngle
  userBrief?: string | null
  intentChip?: AiDesignedIntentId | null
  job?: DesignedJobContext | null
  visualInputs?: DesignedResolvedVisual[] | null
  applyRealLogo?: boolean
  /** Defaults to DESIGNED_IMAGE_QUALITY (medium). TradiesPost passes high. */
  quality?: DesignedImageQuality
  usageContext?: AiUsageContext
}

export type GenerateDesignedImageSuccess = {
  buffer: Buffer
  model: string
  apiMethod: 'images.generate' | 'images.edit'
  durationMs: number
  usage: RecreateImageUsage | null
  estimatedUsd: number | null
  outputBytes: number
}

type DesignedImageResponse = {
  data?: Array<{ b64_json?: string | null } | null> | null
  usage?: RecreateImageUsage | null
}

type DesignedImageFile = Awaited<ReturnType<typeof toFile>>

type GenerateClient = {
  images: {
    generate: (body: {
      model: string
      prompt: string
      size: typeof DESIGNED_IMAGE_SIZE
      quality: typeof DESIGNED_IMAGE_QUALITY | 'high'
      output_format?: 'webp' | 'png'
    }) => Promise<DesignedImageResponse>
    edit?: (body: {
      model: string
      image: DesignedImageFile | DesignedImageFile[]
      prompt: string
      size: typeof DESIGNED_IMAGE_SIZE
      quality: typeof DESIGNED_IMAGE_QUALITY | 'high'
      output_format: 'webp' | 'png'
    }) => Promise<DesignedImageResponse>
  }
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

async function requestDesignedImage(
  client: GenerateClient,
  params: {
    model: string
    prompt: string
    quality: DesignedImageQuality
    visuals: DesignedResolvedVisual[]
    outputFormat: 'webp' | 'png'
  },
): Promise<DesignedImageResponse> {
  if (params.visuals.length === 0) {
    return client.images.generate({
      model: params.model,
      prompt: params.prompt,
      size: DESIGNED_IMAGE_SIZE,
      quality: params.quality,
      output_format: params.outputFormat,
    })
  }
  if (!client.images.edit) {
    throw new RecreateImageError('unknown', 'Reference-image edit is not available')
  }
  const files = await Promise.all(
    params.visuals.map((visual, index) =>
      toFile(visual.buffer, `${index + 1}-${filenameForRecreateReference(visual.mimeType)}`, {
        type: visual.mimeType,
      }),
    ),
  )
  return client.images.edit({
    model: params.model,
    image: files.length === 1 ? files[0] : files,
    prompt: params.prompt,
    size: DESIGNED_IMAGE_SIZE,
    quality: params.quality,
    output_format: params.outputFormat,
  })
}

export async function generateDesignedImage(
  input: GenerateDesignedImageInput,
  deps?: {
    client?: GenerateClient
    convert?: (buffer: Buffer) => Promise<Buffer>
  },
): Promise<GenerateDesignedImageSuccess> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey && !deps?.client) {
    throw new RecreateImageError('unknown', 'OPENAI_API_KEY is not configured')
  }

  const model = resolveOpenAiAiDesignedImageModel()
  const quality = input.quality ?? DESIGNED_IMAGE_QUALITY
  const orderedVisuals = orderDesignedVisualsForProvider(input.visualInputs ?? [])
  for (const visual of orderedVisuals) {
    validateRecreateReferenceImage(visual.buffer, visual.mimeType)
  }
  const prompt = buildDesignedImagePrompt({
    business: input.business,
    messageAngle: input.messageAngle,
    userBrief: input.userBrief,
    intentChip: input.intentChip,
    job: input.job,
    visualInputs: orderedVisuals,
    applyRealLogo: input.applyRealLogo === true,
  })

  const client = deps?.client ?? (new OpenAI({ apiKey }) as unknown as GenerateClient)
  const started = Date.now()
  let raw: Buffer
  let usage: RecreateImageUsage | null = null
  const apiMethod: GenerateDesignedImageSuccess['apiMethod'] =
    orderedVisuals.length > 0 ? 'images.edit' : 'images.generate'

  try {
    let response: DesignedImageResponse
    try {
      response = await requestDesignedImage(client, {
        model,
        prompt,
        quality,
        visuals: orderedVisuals,
        outputFormat: 'webp',
      })
    } catch (firstErr) {
      const classified = classifyOpenAiError(firstErr)
      if (classified.code === 'openai_4xx' && /output_format|webp/i.test(classified.message)) {
        response = await requestDesignedImage(client, {
          model,
          prompt,
          quality,
          visuals: orderedVisuals,
          outputFormat: 'png',
        })
      } else {
        throw classified
      }
    }
    usage = response.usage ?? null
    raw = Buffer.from(decodeEditImageB64(response), 'base64')
    await recordImageGenerationUsage({
      ctx: input.usageContext ?? { feature: 'social_image' },
      model,
      usage,
      status: 'success',
      size: DESIGNED_IMAGE_SIZE,
      quality,
    })
  } catch (err) {
    const classified = classifyOpenAiError(err)
    await recordImageGenerationUsage({
      ctx: input.usageContext ?? { feature: 'social_image' },
      model,
      usage,
      status: 'failed',
      size: DESIGNED_IMAGE_SIZE,
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
      err instanceof Error ? err.message : 'Failed to convert AI Designed image',
    )
  }

  return {
    buffer,
    model: model || DEFAULT_OPENAI_AI_DESIGNED_IMAGE_MODEL,
    apiMethod,
    durationMs,
    usage,
    estimatedUsd: estimateRecreateImageUsd(model, usage),
    outputBytes: buffer.length,
  }
}
