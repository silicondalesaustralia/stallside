import { recordLlmUsage } from '@/lib/aiAgent/llmProvider'
import type { AiUsageContext } from '@/lib/aiUsage/features'
import { INSPIRATION_VISION_MODEL } from '@/lib/social/analyzeInspirationImage'
import { SLIDE_BODY_MAX, SLIDE_HEADING_MAX } from '@/lib/social/tiktokSlides/slideTypes'
import { clipText, type SlideshowWriteResult } from '@/lib/social/slideshow/slideshowTypes'

export type SlideshowWritingContext = {
  businessId: string
  businessName: string
  context: string
  imageUrls: string[]
  /** Same order as imageUrls; small JPEG data URLs for the vision model. */
  visionImages: string[]
  item: { title: string | null; description: string | null; suburb: string | null } | null
}

const SYSTEM_PROMPT = `You write short-video slideshow text for small Australian food and produce sellers (farm stalls, home bakers, market stallholders, local producers).
You are shown the photos in slide order. Write exactly one slide per photo, about what that photo actually shows.
Return ONLY a JSON object: {"slides":[{"heading":"...","body":"..."}],"caption":"..."}.
Rules:
- Slide 1 is a scroll-stopping hook (heading only, body may be a short teaser).
- Middle slides each give one clear point tied to their photo. Heading max 7 words, body max 22 words.
- Last slide is a friendly call to action naming the business.
- Use the seller's notes for facts (prices, dates, places). Never invent prices or claims.
- Plain Australian English, no emojis or hashtags in slides.
- caption: 1-2 short sentences plus 3-5 relevant hashtags, max 300 characters.`

function userText(ctx: SlideshowWritingContext): string {
  const lines = [`Business: ${ctx.businessName}`, `Number of photos / slides: ${ctx.imageUrls.length}`]
  if (ctx.context) lines.push(`Seller's notes: ${ctx.context}`)
  if (ctx.item?.title) lines.push(`Product or offer: ${ctx.item.title}`)
  if (ctx.item?.description) lines.push(`Details: ${ctx.item.description.slice(0, 400)}`)
  if (ctx.item?.suburb) lines.push(`Suburb: ${ctx.item.suburb}`)
  return lines.join('\n')
}

function parseResult(raw: string, imageUrls: string[]): SlideshowWriteResult {
  let parsed: { slides?: unknown; caption?: unknown }
  try {
    parsed = JSON.parse(raw) as { slides?: unknown; caption?: unknown }
  } catch {
    throw new Error('The AI reply was not readable - try again.')
  }
  const list = Array.isArray(parsed.slides) ? parsed.slides : []
  const slides = imageUrls.map((imageUrl, i) => {
    const item = (list[i] && typeof list[i] === 'object' ? list[i] : {}) as Record<string, unknown>
    return { imageUrl, heading: clipText(item.heading, SLIDE_HEADING_MAX), body: clipText(item.body, SLIDE_BODY_MAX) }
  })
  if (slides.some((s) => !s.heading)) throw new Error('The AI did not write a heading for every slide - try again.')
  const caption = typeof parsed.caption === 'string' ? parsed.caption.trim().slice(0, 2200) : ''
  return { slides, caption }
}

/** One heading + body per image, written by a vision model that sees every photo. */
export async function writeSlideshow(ctx: SlideshowWritingContext): Promise<SlideshowWriteResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })
  const usageContext: AiUsageContext = {
    businessId: ctx.businessId,
    feature: 'social_caption',
    relatedEntityType: 'slideshow',
    customerCreditsCharged: 0,
  }

  let response
  try {
    response = await client.chat.completions.create({
      model: INSPIRATION_VISION_MODEL,
      max_tokens: 1500,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText(ctx) },
            ...ctx.visionImages.map((url) => ({ type: 'image_url' as const, image_url: { url, detail: 'low' as const } })),
          ],
        },
      ],
    })
  } catch (err) {
    await recordLlmUsage({ ctx: usageContext, provider: 'openai', model: INSPIRATION_VISION_MODEL, status: 'failed' }).catch(
      () => undefined,
    )
    throw err
  }
  await recordLlmUsage({
    ctx: usageContext,
    provider: 'openai',
    model: INSPIRATION_VISION_MODEL,
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      requestId: response.id,
    },
    status: 'success',
  }).catch((err) => console.warn('[Slideshow] usage record failed', err))
  return parseResult(response.choices[0]?.message?.content?.trim() ?? '{}', ctx.imageUrls)
}
