import { formatTradeCategoryLabel } from '@/lib/social/inferTradeCategory'
import type { AiImageMode } from '@/lib/social/aiImageStyles'

/** Default expansion model - same family as social captions. Override via OPENAI_EXPAND_MODEL env. */
export const DEFAULT_EXPAND_IMAGE_MODEL = 'gpt-4o-mini'

export const EXPAND_IMAGE_MAX_TOKENS = 700
export const EXPAND_IMAGE_MIN_OUTPUT_CHARS = 50
export const EXPAND_IMAGE_MAX_OUTPUT_CHARS = 1200

export type ExpandCustomImagePromptInput = {
  rawPrompt:        string
  mode:             AiImageMode
  businessName:     string
  tradeCategory:    string
  servicesSnippet?: string | null
  brandColor?:      string | null
  jobDescription?:  string | null
}

export type ExpandCustomImagePromptResult =
  | { ok: true; expandedPrompt: string; model: string }
  | { ok: false; reason: string }

/** System prompt - shared across photo and full_post expansion. */
export const EXPAND_CUSTOM_IMAGE_SYSTEM_PROMPT = `You are an expert creative director for Australian trade business social media imagery.

Your job is to expand a tradie's brief description into a detailed, well-structured image generation prompt.

Rules:
- Output ONLY the expanded image prompt - no preamble, no markdown, no bullet points, no quotes.
- Use professional photography and design terminology: composition, lighting, camera angle, depth of field, colour palette, mood, setting, subject placement.
- Stay faithful to what the tradie described - do not invent unrelated scenes, brands, or services they did not imply.
- Keep it appropriate for a professional trades business social media post.
- Never include instructions to add watermarks, logos, or readable text overlays unless the tradie explicitly asked for text in their brief.
- No offensive, violent, adult, or inappropriate content.
- Write as a single flowing paragraph (3-8 sentences), ready to pass directly to an image generation model.
- Australian context where relevant (suburban homes, local trade settings).`

function resolveTradeLabel(tradeCategory: string): string {
  return (
    formatTradeCategoryLabel(tradeCategory) ||
    tradeCategory.replace(/_/g, ' ') ||
    'trade'
  )
}

function formatBrandColor(brandColor: string | null | undefined): string {
  const brand = brandColor?.trim()
  return brand || 'not specified - use a natural professional palette'
}

function formatServices(servicesSnippet: string | null | undefined): string {
  return servicesSnippet?.trim() || 'general trade services'
}

/** Build the user message for gpt-4o-mini - exported for testing. */
export function buildExpandCustomImageUserPrompt(
  input: ExpandCustomImagePromptInput,
): string {
  const tradeLabel = resolveTradeLabel(input.tradeCategory)
  const businessName = input.businessName.trim() || 'Your Business'
  const services = formatServices(input.servicesSnippet)
  const brandColor = formatBrandColor(input.brandColor)
  const jobContext = input.jobDescription?.trim()

  const contextLines = [
    'BUSINESS CONTEXT:',
    `- Business: ${businessName}`,
    `- Trade: ${tradeLabel}`,
    `- Services: ${services}`,
    `- Brand accent colour: ${brandColor}`,
  ]

  if (jobContext) {
    contextLines.push(`- Job context: ${jobContext}`)
  }

  if (input.mode === 'full_post') {
    return [
      'Expand this tradie image brief into a detailed image generation prompt.',
      '',
      ...contextLines,
      '',
      'OUTPUT TYPE: Complete social media graphic (square format).',
      `The business name "${businessName}" should appear prominently and tastefully in the design.`,
      'Do NOT describe or request a logo, brand mark, or watermark - the real logo is composited separately after generation.',
      '',
      "TRADIE'S BRIEF:",
      input.rawPrompt.trim(),
    ].join('\n')
  }

  return [
    'Expand this tradie image brief into a detailed image generation prompt.',
    '',
    ...contextLines,
    '',
    'OUTPUT TYPE: Clean scene photograph for use inside a social media template.',
    'The image must have NO text, NO logos, NO watermarks, NO readable signage.',
    '',
    "TRADIE'S BRIEF:",
    input.rawPrompt.trim(),
  ].join('\n')
}

/** Normalise LLM output - collapse whitespace, enforce length bounds. */
export function normaliseExpandedImagePrompt(text: string): string | null {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (collapsed.length < EXPAND_IMAGE_MIN_OUTPUT_CHARS) return null
  if (collapsed.length <= EXPAND_IMAGE_MAX_OUTPUT_CHARS) return collapsed
  return collapsed.slice(0, EXPAND_IMAGE_MAX_OUTPUT_CHARS).trim()
}

/**
 * Stage 1 - expand a tradie's custom brief into a detailed image prompt via gpt-4o-mini.
 * Returns { ok: false } on any failure - caller should fall back to raw prompt.
 */
export async function expandCustomImagePrompt(
  input: ExpandCustomImagePromptInput,
): Promise<ExpandCustomImagePromptResult> {
  const rawPrompt = input.rawPrompt.trim()
  if (!rawPrompt) {
    return { ok: false, reason: 'empty_raw_prompt' }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, reason: 'missing_openai_api_key' }
  }

  const model = process.env.OPENAI_EXPAND_MODEL?.trim() || DEFAULT_EXPAND_IMAGE_MODEL

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const response = await client.chat.completions.create({
      model,
      max_tokens: EXPAND_IMAGE_MAX_TOKENS,
      temperature: 0.7,
      messages: [
        { role: 'system', content: EXPAND_CUSTOM_IMAGE_SYSTEM_PROMPT },
        { role: 'user', content: buildExpandCustomImageUserPrompt(input) },
      ],
    })

    const rawOutput = response.choices[0]?.message?.content ?? ''
    const expandedPrompt = normaliseExpandedImagePrompt(rawOutput)

    if (!expandedPrompt) {
      console.warn('[AiImage/expand] Output too short or empty', {
        mode: input.mode,
        rawPromptLength: rawPrompt.length,
        outputLength: rawOutput.trim().length,
        model,
      })
      return { ok: false, reason: 'output_too_short' }
    }

    console.log('[AiImage/expand] Success', {
      mode: input.mode,
      rawPromptLength: rawPrompt.length,
      expandedPromptLength: expandedPrompt.length,
      model,
    })

    return { ok: true, expandedPrompt, model }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[AiImage/expand] Failed', {
      mode: input.mode,
      rawPromptLength: rawPrompt.length,
      model,
      error: message,
    })
    return { ok: false, reason: message || 'expansion_failed' }
  }
}
