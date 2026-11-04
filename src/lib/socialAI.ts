// ============================================================
// lib/socialAI.ts
// AI caption generator - uses OpenAI in production.
// Falls back to realistic mock captions when OPENAI_API_KEY
// is not set OR when SOCIAL_DEMO_MODE=true.
// ============================================================

import {
  DEFAULT_POST_SUBTYPE_ID,
  getPostSubtypeDefinition,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'
import { CAPTION_HASHTAGS, captionFrameworkSystem } from '@/lib/social/captionFramework'

export type SocialPlatform = 'instagram' | 'facebook' | 'gmb' | 'linkedin'
export type BrandVoice = 'professional' | 'casual' | 'punchy'

interface CaptionOptions {
  businessId?: string | null
  businessName: string
  tradeType: string
  jobTitle: string
  jobDescription: string
  suburb: string
  state: string
  platform: SocialPlatform
  brandVoice: BrandVoice
  cta: string
  phone: string
  defaultHashtags: string
  photoCount: number
  postSubtype?: PostSubtypeId
  /** Quote card testimonial - included in caption prompt when present. */
  quoteText?: string
  customerName?: string
}

// ── Mock caption generator ────────────────────────────────────────────────────

function buildHashtags(businessType: string, suburb: string, state: string): string {
  const kind = businessType.replace(/\s+/g, '')
  const sub = suburb.replace(/\s+/g, '')
  return [
    `#${sub}${state}`,
    `#${kind}${state}`,
    `#ShopLocal`,
    `#SupportLocal`,
    `#${sub}Local`,
    `#FreshLocal`,
    `#FarmToTable`,
    `#MadeLocally`,
    `#${state}Producers`,
    `#${kind}Life`,
  ].join(' ')
}

function mockCaptions(opts: CaptionOptions): string[] {
  const {
    businessName,
    tradeType,
    jobTitle,
    suburb,
    state,
    phone,
    cta,
    postSubtype = DEFAULT_POST_SUBTYPE_ID,
    quoteText,
    customerName,
  } = opts
  const t = tradeType || 'Local producer'
  const s = suburb || 'your area'
  const hashtags = buildHashtags(t, s, state || 'Australia')
  const brief = getPostSubtypeDefinition(postSubtype).captionBrief
  const reviewLine = quoteText?.trim()
    ? `"${quoteText.trim()}"${customerName?.trim() ? ` - ${customerName.trim()}` : ''}`
    : null

  const professional = `${brief}
${reviewLine ? `\n${reviewLine}\n` : ''}
${businessName} - ${jobTitle} in ${s}.

📞 ${phone || 'Contact us'}
${cta}

${hashtags}`

  const casual = `${brief} 🙌

${jobTitle} in ${s} - ${businessName} has you covered.

📞 ${phone || 'Contact us'}

#${s.replace(/\s+/g, '')}Local #ShopLocal`

  const punchy = `${s}. ${jobTitle}. ✓

${brief}

📞 ${phone || 'Contact us'}`

  return [professional, casual, punchy]
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateSocialCaption(options: CaptionOptions): Promise<string[]> {
  const demoMode =
    process.env.SOCIAL_DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY

  if (demoMode) {
    console.log('[SocialAI] Demo mode - returning mock captions (set OPENAI_API_KEY to enable live generation)')
    return mockCaptions(options)
  }

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const {
    businessName, tradeType, jobTitle, jobDescription,
    suburb, state, platform, brandVoice, cta, phone,
    defaultHashtags, photoCount,
    postSubtype = DEFAULT_POST_SUBTYPE_ID,
    quoteText,
    customerName,
  } = options

  const occasion = getPostSubtypeDefinition(postSubtype)
  const angleBrief = occasion.captionBrief
  const testimonialBlock =
    quoteText?.trim()
      ? `\nCustomer testimonial on the image: "${quoteText.trim()}"${customerName?.trim() ? ` - ${customerName.trim()}` : ''}.\nWrite captions that highlight this review authentically. Reference the customer's words where natural.`
      : ''

  const voiceMap: Record<BrandVoice, string> = {
    professional: 'Clear, trustworthy, expert tone. Confident but not arrogant.',
    casual: 'Friendly, relatable, conversational. Like the owner chatting to regulars at the stall.',
    punchy: 'Short, bold, direct statements. Every word earns its place.',
  }

  const platformReqs: Record<SocialPlatform, string> = {
    instagram: `Follow the structure and style rules. ${CAPTION_HASHTAGS.min}-${CAPTION_HASHTAGS.max} hashtags on their own line.`,
    facebook: `Follow the structure and style rules. ${CAPTION_HASHTAGS.min}-${CAPTION_HASHTAGS.max} hashtags on their own line, include location.`,
    gmb: 'Google Business Profile: 60-120 words, local SEO focused. Include suburb + state + what you sell. No hashtags and no emojis.',
    linkedin: `Professional take on the same structure, focus on quality, provenance and care. ${CAPTION_HASHTAGS.min}-${CAPTION_HASHTAGS.max} hashtags.`,
  }

  const userPrompt = `${angleBrief}

Occasion: ${occasion.label} (${postSubtype}).${testimonialBlock}

BUSINESS CONTEXT: ${businessName}, a ${tradeType} based in ${suburb} ${state}.
Write 3 different ${platform} captions for ${businessName}.

What the post is about: ${jobTitle}
Details: ${jobDescription || 'Fresh, locally made products'}
Use real details from above (prices, order-by and collection dates, what's included) when given. Never invent prices or dates.
Location: ${suburb}, ${state}
Photos: ${photoCount}

Brand voice: ${brandVoice} - ${voiceMap[brandVoice]}
CTA: ${cta}
Phone: ${phone || 'Contact us'}
${defaultHashtags ? `Base hashtags: ${defaultHashtags}` : ''}

Platform requirements: ${platformReqs[platform]}

Return EXACTLY 3 captions separated by ---VARIATION--- with no extra text.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1600,
    messages: [
      {
        role: 'system',
        content: [
          ...captionFrameworkSystem(),
          'OPTIONS:',
          '- This request asks for 3 alternative captions. Each one follows every rule above on its own; vary the hook and angle between them.',
        ].join('\n'),
      },
      { role: 'user', content: userPrompt },
    ],
  })

  const { recordOpenAiChatUsage } = await import('@/lib/aiUsage/recordOpenAiChat')
  await recordOpenAiChatUsage({
    ctx: {
      businessId: options.businessId,
      feature: 'social_caption',
      customerCreditsCharged: 0,
    },
    model: 'gpt-4o-mini',
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    requestId: response.id,
    status: 'success',
  })

  const text = response.choices[0]?.message?.content ?? ''
  const variations = text
    .split('---VARIATION---')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)

  while (variations.length < 3) variations.push(variations[0] || mockCaptions(options)[0])
  return variations.slice(0, 3)
}
