import {
  buildVideoCaptionPrompt,
  mockVideoCaption,
  type VideoCaptionContext,
} from '@/lib/social/videoCaptionContext'
import { recordOpenAiChatUsage } from '@/lib/aiUsage/recordOpenAiChat'

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
    max_tokens: 500,
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

/** Text-only. Never charged against render credits. */
export async function generateVideoCaption(
  input: VideoCaptionContext,
  generateText: VideoCaptionTextFn = (system, user) =>
    defaultVideoCaptionText(system, user, input.businessId),
): Promise<string> {
  const { system, user } = buildVideoCaptionPrompt(input)
  try {
    const text = (await generateText(system, user)).trim()
    if (text) return text
  } catch {
    // Demo / missing key / empty model
  }
  return mockVideoCaption(input)
}
