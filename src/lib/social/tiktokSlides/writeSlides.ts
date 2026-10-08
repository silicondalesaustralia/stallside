import { callLLM } from '@/lib/aiAgent/llmProvider'
import { sanitizeSlideTexts, type TikTokSlideText } from '@/lib/social/tiktokSlides/slideTypes'

export type SlideWritingContext = {
  businessId: string
  businessName: string
  topic: string
  slideCount: number
  job: { title: string | null; description: string | null; suburb: string | null } | null
}

const SYSTEM_PROMPT = `You write TikTok photo-carousel slides for small Australian food and produce sellers (farm stalls, home bakers, market stallholders, local producers).
Return ONLY a JSON object: {"slides":[{"heading":"...","body":"..."}],"caption":"..."}.
Rules:
- Slide 1 is a scroll-stopping hook (heading only, body may be a short teaser).
- Middle slides each give one clear, practical point. Heading max 7 words, body max 25 words.
- Last slide is a friendly call to action naming the business.
- Plain Australian English, no emojis in slides, no hashtags in slides, no prices unless given.
- caption: 1-2 short sentences plus 3-5 relevant hashtags, max 300 characters.`

function extractJsonObject(text: string): unknown {
  const fence = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : text.trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in slide response')
  return JSON.parse(candidate.slice(start, end + 1))
}

function userPrompt(ctx: SlideWritingContext): string {
  const lines = [
    `Business: ${ctx.businessName}`,
    `Topic: ${ctx.topic}`,
    `Number of slides: ${ctx.slideCount}`,
  ]
  if (ctx.job) {
    if (ctx.job.title) lines.push(`Product or offer: ${ctx.job.title}`)
    if (ctx.job.description) lines.push(`Details: ${ctx.job.description.slice(0, 400)}`)
    if (ctx.job.suburb) lines.push(`Suburb: ${ctx.job.suburb}`)
  }
  return lines.join('\n')
}

export async function writeTikTokSlides(
  ctx: SlideWritingContext,
): Promise<{ slides: TikTokSlideText[]; caption: string }> {
  const result = await callLLM(SYSTEM_PROMPT, [{ role: 'user', content: userPrompt(ctx) }], {
    maxTokens: 1500,
    temperature: 0.6,
    usageContext: {
      businessId: ctx.businessId,
      feature: 'social_caption',
      relatedEntityType: 'tiktok_slides',
      customerCreditsCharged: 0,
    },
  })
  const parsed = extractJsonObject(result.content) as { slides?: unknown; caption?: unknown }
  const slides = sanitizeSlideTexts(parsed.slides, ctx.slideCount)
  if (!slides) throw new Error('The AI did not return usable slides - try again.')
  const caption = typeof parsed.caption === 'string' ? parsed.caption.trim().slice(0, 2200) : ''
  return { slides, caption }
}
