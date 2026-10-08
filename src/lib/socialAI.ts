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

function buildHashtags(tradeType: string, suburb: string, state: string): string {
  const trade = tradeType.replace(/\s+/g, '')
  const sub = suburb.replace(/\s+/g, '')
  return [
    `#${trade}${state}`,
    `#${sub}${state}`,
    `#${trade}Australia`,
    `#QualityTrades`,
    `#Licensed${trade}`,
    `#${sub}Trades`,
    `#${state}Trades`,
    `#AussieTradie`,
    `#TradesAustralia`,
    `#${trade}Life`,
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
  const t = tradeType || 'Trade'
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

#${s.replace(/\s+/g, '')}Trades`

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
    casual: 'Friendly, relatable, conversational. Like a mate talking about their work.',
    punchy: 'Short, bold, direct statements. Every word earns its place.',
  }

  const platformReqs: Record<SocialPlatform, string> = {
    instagram: '150-220 chars + 15-20 relevant hashtags. Start with a hook. End with CTA. Then hashtags on a new line.',
    facebook: '100-200 chars, conversational, 3-5 hashtags only, include location.',
    gmb: '100-150 chars, local SEO focused. Include suburb + state + trade type. No hashtags.',
    linkedin: '150-250 chars, professional, focus on quality and expertise, 5-8 hashtags.',
  }

  const userPrompt = `${angleBrief}

Occasion: ${occasion.label} (${postSubtype}).${testimonialBlock}

Write 3 different ${platform} captions for ${businessName}, a ${tradeType} business based in ${suburb} ${state}.

Job context: ${jobTitle}
Details: ${jobDescription || 'Quality trade work'}
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
    max_tokens: 800,
    messages: [
      {
        role: 'system',
        content: 'You are a social media expert for Australian trade businesses. Write authentic, local captions that convert viewers into leads. Sound like a proud tradie, not a marketing agency.',
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
