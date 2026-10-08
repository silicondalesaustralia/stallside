/**
 * Recreate-only prompt for gpt-image-2 images.edit - reference-driven reinterpretation.
 * Not used by ordinary photo generation (buildAiImagePrompt photo mode).
 */

import { buildServicesSnippet } from '@/lib/social/aiImagePrompt'
import {
  formatCanonicalTradeLabel,
  inferCanonicalTrade,
} from '@/lib/social/canonicalTrades'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import { formatCampaignFocusPromptLines } from '@/lib/social/campaignFocusInstructions'
import { parseCampaignFocus } from '@/lib/social/normalizeCampaignFocus'
import {
  RECREATE_MESSAGE_ANGLE_LABELS,
  recreateMessageAngleAt,
  type RecreateMessageAngle,
} from '@/lib/social/recreateMessageAngles'
import type { RecreateMode } from '@/lib/social/recreateModes'

export const RECREATE_ORIGINALITY_RULES = [
  'The supplied image is creative inspiration only - it is NOT content to copy.',
  'Learn why the reference works, then create something new for this brand.',
  'DO NOT copy the original business name, logo, headline, body copy, offer, phone number, or URL.',
  'DO NOT paraphrase the original headline just to make it slightly different.',
  'DO NOT reproduce the screenshot pixel-for-pixel or do a simple logo/text swap.',
  'DO NOT imitate distinctive source branding too literally.',
  'DO NOT invent a promotional offer. Only use an offer if the target business supplied one or the user typed one in campaign notes.',
  'DO NOT invent review ratings, years in business, certifications, job counts, guarantees, or awards.',
  'DO understand broad visual structure, promotional hierarchy, image/graphic balance, visual energy, typography character, colour relationships, shape language, and layout rhythm.',
  'DO create an ORIGINAL branded reinterpretation with fresh imagery and new messaging for the target business.',
  'Retain professional social-ad quality. Square 1:1 finished advertisement - not a blank photo.',
  'Avoid placing critical copy or important visual details directly in the extreme corners of the design.',
] as const

export const CLOSEST_MODE_RULES = [
  'RECREATE MODE: Closest - make something like this for the target business.',
  'You MAY preserve broad promotional architecture, image-vs-graphics balance, hierarchy, design energy, type character, band/panel relationships, framing concept, and colour relationships.',
  'You MUST write new copy, use new imagery, and use only the target business identity.',
  'Change distinctive source branding and unique motifs. No pixel-level reproduction. No logo/text swap.',
  'The result should clearly remind the user why they uploaded that inspiration, without copying it.',
] as const

export const FRESH_TAKE_MODE_RULES = [
  'RECREATE MODE: Fresh take - keep the energy and style, but create a new composition.',
  'You MAY preserve energy, sophistication, contrast, density, typography character, general image-vs-graphics ratio, and broad colour relationship.',
  'You MUST change composition, image placement, shape placement, grid, arrangement, headline lockup, and overall structure.',
  'This must read as a new design, not the same poster rebuilt.',
] as const

export const BOLD_DIRECT_ANGLE_RULES = [
  'MESSAGING ANGLE: Bold & direct.',
  'Lead with a clear outcome, strong service or value proposition, urgency where appropriate, and a stronger CTA.',
  'Do not invent offers or discounts.',
] as const

export const HELPFUL_EDUCATIONAL_ANGLE_RULES = [
  'MESSAGING ANGLE: Helpful & educational.',
  'Lead with useful advice, problem awareness, short tips, or a simple explanation, and a softer CTA.',
] as const

export const TRUST_PROOF_ANGLE_RULES = [
  'MESSAGING ANGLE: Trust & proof.',
  'Lead with credibility, reliability, and reassurance.',
  'Use guarantees, reviews, years, or licensing ONLY if supplied in the target business data or campaign notes.',
  'If proof data is not available, use softer credibility wording with NO fake statistics.',
] as const

/** Shared negatives - never ask the model to draw a missing-logo hole. */
export const RECREATE_NO_PLACEHOLDER_RULES = [
  'Do not draw a logo, an emblem, a brand mark, a logo placeholder, a blank logo box, or a fake logo badge.',
  'Do not write text saying logo, logo here, your logo here, place logo here, brand here, or company logo.',
  'Do not create an empty white rectangle or a cutout that looks like a missing logo.',
  'Do not invent an icon plus company-name lockup, initials mark, or pseudo brand symbol.',
] as const

export const RECREATE_LOGO_RULES = [
  'Keep the upper-left area visually quiet and relatively uncluttered.',
  'Do not place important photography, faces, headlines, icons, badges or decorative marks in that area.',
  ...RECREATE_NO_PLACEHOLDER_RULES,
  'Do not invent a top-corner, bottom-corner, or footer brand header or fake company wordmark.',
  'The business name may appear as ordinary headline or supporting copy, but not as a corner or footer logo lockup.',
  'Simply continue the normal background and design treatment through that area with enough visual calm for branding.',
  'The advertisement should look completely finished as a normal design, not like a template with a missing logo.',
] as const

export const RECREATE_NO_LOGO_RULES = [
  'Design a complete finished advertisement. Compose the layout normally.',
  ...RECREATE_NO_PLACEHOLDER_RULES,
  'Do not create, redraw or invent a company logo, wordmark, or brand badge.',
] as const

export type RecreateBusinessContext = {
  name?: string | null
  phone?: string | null
  website?: string | null
  suburb?: string | null
  brand_color?: string | null
  brand_text_color?: string | null
  ai_agent_services?: string | null
  social_default_cta?: string | null
  social_brand_voice?: string | null
}

export type RecreateVariantMessaging = {
  angleId: RecreateMessageAngle
  angleLabel: string
  headline?: string | null
  tagline?: string | null
  cta?: string | null
}

export function variantMessagingFromContent(
  content: unknown,
  variantIndex: number,
): RecreateVariantMessaging {
  const angleId = recreateMessageAngleAt(variantIndex)
  const angleLabel = RECREATE_MESSAGE_ANGLE_LABELS[angleId]
  if (!content || typeof content !== 'object') {
    return { angleId, angleLabel }
  }
  const row = content as Record<string, unknown>
  const text = (key: string): string | null => {
    const value = row[key]
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }
  return {
    angleId,
    angleLabel,
    headline: text('headline') || text('title') || text('introLine'),
    tagline: text('tagline') || text('quoteText'),
    cta: text('cta') || text('ctaLine') || text('footerCta'),
  }
}

function angleRules(angleId: RecreateMessageAngle): readonly string[] {
  if (angleId === 'helpful_educational') return HELPFUL_EDUCATIONAL_ANGLE_RULES
  if (angleId === 'trust_proof') return TRUST_PROOF_ANGLE_RULES
  return BOLD_DIRECT_ANGLE_RULES
}

export function buildRecreateImagePrompt(params: {
  business: RecreateBusinessContext
  hints: InspirationGenerationHints
  messaging: RecreateVariantMessaging
  recreateMode: RecreateMode
  campaignFocus?: string | null
  /** True when the real logo will be composited after generation. */
  applyRealLogo?: boolean
}): string {
  const tradeId = inferCanonicalTrade({
    ai_agent_services: params.business.ai_agent_services,
    name: params.business.name,
  })
  const tradeLabel = tradeId ? formatCanonicalTradeLabel(tradeId) : 'Trade'
  const businessName = params.business.name?.trim() || 'Your Business'
  const services = buildServicesSnippet(params.business, 160)
  const suburb = params.business.suburb?.trim()
  const website = params.business.website?.trim()
  const phone = params.business.phone?.trim()
  const cta = params.business.social_default_cta?.trim()
  const voice = params.business.social_brand_voice?.trim()
  const brandColor = params.business.brand_color?.trim()
  const brandTextColor = params.business.brand_text_color?.trim()
  const parsedFocus = parseCampaignFocus(params.campaignFocus)
  const campaignFocus =
    parsedFocus.ok
      ? parsedFocus.value
      : typeof params.campaignFocus === 'string' && params.campaignFocus.trim()
        ? params.campaignFocus.trim()
        : null

  const lines = [
    `Create an original square social-media advertisement for ${businessName}, a ${tradeLabel} business.`,
    ...RECREATE_ORIGINALITY_RULES,
    '',
    ...(params.applyRealLogo ? RECREATE_LOGO_RULES : RECREATE_NO_LOGO_RULES),
  ]

  if (campaignFocus) {
    lines.push('')
    lines.push(...formatCampaignFocusPromptLines(campaignFocus, params.recreateMode))
  }

  lines.push('')
  lines.push(...(params.recreateMode === 'fresh_take' ? FRESH_TAKE_MODE_RULES : CLOSEST_MODE_RULES))
  lines.push('')
  lines.push(...angleRules(params.messaging.angleId))

  lines.push('')
  lines.push('Target business context (use this identity - never the source screenshot identity):')
  lines.push(`- Business name: ${businessName}`)
  lines.push(`- Trade / category: ${tradeLabel}`)

  if (services) lines.push(`- Services: ${services}`)
  if (suburb) lines.push(`- Location: ${suburb}`)
  if (voice) lines.push(`- Brand voice: ${voice}`)
  if (brandColor) lines.push(`- Brand colour: ${brandColor}`)
  if (brandTextColor) lines.push(`- Brand text colour: ${brandTextColor}`)
  if (website) lines.push(`- Website (target brand only): ${website}`)
  if (phone) lines.push(`- Phone (target brand only): ${phone}`)
  if (cta) lines.push(`- Business CTA: ${cta}`)

  lines.push('')
  lines.push('Messaging angle for this variant (write new copy in this spirit - do not reuse source wording):')
  lines.push(`- Angle: ${params.messaging.angleLabel}`)
  if (params.messaging.headline) {
    lines.push(`- Suggested headline direction: ${params.messaging.headline}`)
  }
  if (params.messaging.tagline) {
    lines.push(`- Suggested supporting line: ${params.messaging.tagline}`)
  }
  if (params.messaging.cta) {
    lines.push(`- Suggested CTA: ${params.messaging.cta}`)
  }

  lines.push('')
  lines.push(
    campaignFocus
      ? 'Reference visual study (structure and energy only). If theme or subject conflicts with USER INSTRUCTIONS, follow the user instructions and discard the conflicting inferred Creative Direction:'
      : 'Reference visual study (structure and energy only - not copy, offers, or identity to reuse):',
  )
  lines.push(`- Visual style: ${params.hints.visualStyle}`)
  lines.push(`- Layout rhythm: ${params.hints.layoutOrientation}`)
  lines.push(`- Theme (paraphrased): ${params.hints.theme.themeSummary}`)
  lines.push(`- Tone: ${params.hints.theme.tone}`)
  lines.push(`- Subject: ${params.hints.theme.subjectCategory}`)

  return lines.join('\n')
}
