import {
  buildVideoCaptionPrompt,
  mockVideoCaption,
  type VideoCaptionContext,
} from '@/lib/social/videoCaptionContext'
import { recordOpenAiChatUsage } from '@/lib/aiUsage/recordOpenAiChat'
import {
  fallbackVideoPostTitle,
  parseVideoCaptionResponse,
  type VideoCaptionResult,
} from '@/lib/social/videoCaptionTitle'

export type VideoCaptionTextFn = (system: string, user: string) => Promise<string>

async function defaultVideoCaptionText(
  system: string,
  user: string,
  businessId?: string | null,
): Promise<string> {
  const demoMode = process.env.SOCIAL_DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY?.trim()
  if (demoMode) {
    throw new Error('demo')
  }
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  await recordOpenAiChatUsage({
    ctx: {
      businessId,
      feature: 'social_caption',
      customerCreditsCharged: 0,
    },
    model: 'gpt-4o-mini',
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    requestId: response.id,
    status: 'success',
  })
  const text = response.choices[0]?.message?.content?.trim() ?? ''
  if (!text) throw new Error('empty')
  return text
}

/** Caption, post title and YouTube tags from one model call. Text-only; never charged against render credits. */
export async function generateVideoCaption(
  input: VideoCaptionContext,
  generateText: VideoCaptionTextFn = (system, user) =>
    defaultVideoCaptionText(system, user, input.businessId),
): Promise<VideoCaptionResult> {
  const { system, user } = buildVideoCaptionPrompt(input)
  let result: VideoCaptionResult | null = null
  try {
    result = parseVideoCaptionResponse(await generateText(system, user))
  } catch (err) {
    if (!(err instanceof Error && err.message === 'demo')) {
      console.warn('[VideoCaption] Model call failed, using fallback', err instanceof Error ? err.message : err)
    }
  }
  return {
    caption: result?.caption || mockVideoCaption(input),
    title: result?.title || fallbackVideoPostTitle(input),
    tags: result?.tags ?? [],
  }
}
