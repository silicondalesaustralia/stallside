import { recordOpenAiChatUsage } from '@/lib/aiUsage/recordOpenAiChat'
import {
  PINTEREST_TITLE_MAX,
  cleanPinterestTitle,
  defaultPinterestTitle,
  tidyPinterestTitle,
} from '@/lib/social/pinterest/pinterestSettings'

const MODEL = 'gpt-4o-mini'

const SYSTEM = [
  'You write Pinterest Pin titles for small food producers (market stalls, farm stands, home bakers).',
  `Write one title, at most ${PINTEREST_TITLE_MAX} characters, ideally 40-70.`,
  'Lead with what the product is, using words people search for on Pinterest.',
  'No hashtags, no emojis, no quotation marks, no trailing full stop. Reply with the title only.',
].join(' ')

/** AI Pin title from the caption (and linked item name); falls back to the caption's first line. */
export async function generatePinterestTitle(input: {
  businessId: string
  caption: string
  itemTitle: string | null
}): Promise<string> {
  const fallback = cleanPinterestTitle(input.itemTitle ?? '') || defaultPinterestTitle(input.caption)
  if (process.env.SOCIAL_DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY?.trim()) return fallback

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const user = [input.itemTitle ? `Product: ${input.itemTitle}` : null, `Post caption:\n${input.caption}`]
      .filter(Boolean)
      .join('\n\n')
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 60,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    })
    await recordOpenAiChatUsage({
      ctx: { businessId: input.businessId, feature: 'social_caption', customerCreditsCharged: 0 },
      model: MODEL,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      requestId: response.id,
      status: 'success',
    })
    return tidyPinterestTitle(response.choices[0]?.message?.content ?? '') || fallback
  } catch (err) {
    console.error('[Pinterest] Title generation failed, using fallback', err)
    return fallback
  }
}
