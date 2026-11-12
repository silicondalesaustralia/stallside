import { recordLlmUsage } from '@/lib/aiAgent/llmProvider'
import type { AiUsageContext } from '@/lib/aiUsage/features'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import {
  parsePlatformCaptionsReply,
  type PlatformCaptionsRequest,
  type PlatformCaptionsResult,
} from '@/lib/social/platformCaptions/platformCaptionTypes'

const MODEL = 'gpt-4o-mini'

/** What each platform needs, as JSON fields + style. Keys match platforms.<platform> in the reply. */
const PLATFORM_BRIEFS: Record<SocialPublishPlatform, string> = {
  facebook: '{"headline","caption"}: headline is a punchy first line (max 80 chars, no hashtags). Caption is warm and conversational, 2-4 short paragraphs, mentions the location, ends with the call to action and 3-5 hashtags on their own line.',
  instagram: '{"caption"}: hook first line, short paragraphs with line breaks, up to 150 words, a few relevant emojis, call to action, then 5-10 hashtags on their own line.',
  tiktok: '{"caption"}: 1-2 short punchy sentences (max 250 chars) plus 3-5 trending-style hashtags.',
  youtube: '{"title","caption","tags"}: title max 70 chars, searchable, no hashtags. caption is the video description: 2-3 short paragraphs naming the business and location, call to action, max 3 hashtags at the end. tags: 6-12 short keyword phrases.',
  pinterest: '{"title","caption"}: title max 100 chars, keyword-rich, no hashtags or emojis. caption is the Pin description: 2-3 keyword-rich sentences, max 450 chars, no hashtags.',
  x: '{"caption"}: one post, max 240 characters including 1-2 hashtags. Direct and conversational.',
  gmb: '{"caption"}: Google Business update, 60-120 words, local-SEO friendly (suburb, state and what is sold), call to action, no hashtags and no emojis.',
}

const SYSTEM_PROMPT = `You write social media posts for small Australian food and produce sellers (farm stalls, home bakers, market stallholders, local producers).
Use only the facts given (prices, dates, places, products). Never invent prices, dates, awards or claims.
Plain Australian English. Return ONLY a JSON object.`

function userPrompt(request: PlatformCaptionsRequest, lines: string[]): string {
  const wanted = request.platforms.map((p) => `- ${p}: ${PLATFORM_BRIEFS[p]}`).join('\n')
  const parts = ['FACTS:', ...lines]
  if (request.mainCaption.trim() && !request.includeMain) {
    parts.push('', `The seller's main caption (adapt it for each platform, keep its facts and intent):\n${request.mainCaption.trim()}`)
  }
  parts.push('', 'Reply as {"main": string|null, "platforms": {<platform>: {...}}}.')
  parts.push(
    request.includeMain
      ? 'main: a general caption that works on Instagram and Facebook (hook, 2-3 short paragraphs, call to action, 3-6 hashtags on their own line).'
      : 'main: null.',
  )
  if (wanted) parts.push('platforms - write one entry for each of these, each tailored to that platform:', wanted)
  return parts.join('\n')
}

/** One AI call writes the main caption and/or every requested platform's text. */
export async function writePlatformCaptions(input: {
  businessId: string
  request: PlatformCaptionsRequest
  lines: string[]
}): Promise<PlatformCaptionsResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })
  const usageContext: AiUsageContext = {
    businessId: input.businessId,
    feature: 'social_caption',
    relatedEntityType: 'platform_captions',
    customerCreditsCharged: 0,
  }

  let response
  try {
    response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt(input.request, input.lines) },
      ],
    })
  } catch (err) {
    await recordLlmUsage({ ctx: usageContext, provider: 'openai', model: MODEL, status: 'failed' }).catch(() => undefined)
    throw err
  }
  await recordLlmUsage({
    ctx: usageContext,
    provider: 'openai',
    model: MODEL,
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      requestId: response.id,
    },
    status: 'success',
  }).catch((err) => console.warn('[PlatformCaptions] usage record failed', err))
  return parsePlatformCaptionsReply(response.choices[0]?.message?.content?.trim() ?? '{}', input.request)
}
