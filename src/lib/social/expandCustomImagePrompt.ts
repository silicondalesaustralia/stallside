import { businessKindLabel } from '@/lib/social/inferTradeCategory'
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
export const EXPAND_CUSTOM_IMAGE_SYSTEM_PROMPT = `You are an expert creative director for social media imagery for small Australian food and produce sellers (farm stalls, home bakers, market stallholders, local producers).

Your job is to expand the seller's brief description into a detailed, well-structured image generation prompt.

Rules:
- Output ONLY the expanded image prompt - no preamble, no markdown, no bullet points, no quotes.
- Use professional food and product photography terminology: composition, natural lighting, camera angle, depth of field, colour palette, mood, setting, styling, subject placement.
- Stay faithful to what the seller described - do not invent unrelated scenes, brands, or products they did not imply.
- Keep it appropriate for a local small business social media post. Food should look fresh, real and appetising, not plastic or over-styled.
- Never include instructions to add watermarks, logos, or readable text overlays unless the seller explicitly asked for text in their brief.
- No offensive, violent, adult, or inappropriate content.
- Write as a single flowing paragraph (3-8 sentences), ready to pass directly to an image generation model.
- Australian context where relevant (roadside stalls, farmers markets, country kitchens, backyard gardens).`

function resolveTradeLabel(tradeCategory: string): string {
  return businessKindLabel(tradeCategory)
}

function formatBrandColor(brandColor: string | null | undefined): string {
  const brand = brandColor?.trim()
  return brand || 'not specified - use a natural professional palette'
}

function formatServices(servicesSnippet: string | null | undefined): string {
  return servicesSnippet?.trim() || 'local food and produce'
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
    `- Business type: ${tradeLabel}`,
    `- What they sell: ${services}`,
    `- Brand accent colour: ${brandColor}`,
  ]

  if (jobContext) {
    contextLines.push(`- Product / offer context: ${jobContext}`)
  }

  if (input.mode === 'full_post') {
    return [
      "Expand this seller's image brief into a detailed image generation prompt.",
      '',
      ...contextLines,
      '',
      'OUTPUT TYPE: Complete social media graphic (square format).',
      `The business name "${businessName}" should appear prominently and tastefully in the design.`,
      'Do NOT describe or request a logo, brand mark, or watermark - the real logo is composited separately after generation.',
      '',
      "SELLER'S BRIEF:",
      input.rawPrompt.trim(),
    ].join('\n')
  }

  return [
    "Expand this seller's image brief into a detailed image generation prompt.",
    '',
    ...contextLines,
    '',
    'OUTPUT TYPE: Clean scene photograph for use inside a social media template.',
    'The image must have NO text, NO logos, NO watermarks, NO readable signage.',
    '',
    "SELLER'S BRIEF:",
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
 * Stage 1 - expand a seller's custom brief into a detailed image prompt via gpt-4o-mini.
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
