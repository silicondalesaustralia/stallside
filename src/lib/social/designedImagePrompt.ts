/**
 * AI Designed prompt - complete ad creative via images.generate().
 * Isolated from Recreate (images.edit) and gpt-image-1 photo prompts.
 */

import { buildServicesSnippet } from '@/lib/social/aiImagePrompt'
import {
  formatCanonicalTradeLabel,
  inferCanonicalTrade,
} from '@/lib/social/canonicalTrades'
import { DEFAULT_BUSINESS_KIND } from '@/lib/social/inferTradeCategory'
import { structureCampaignFocus } from '@/lib/social/campaignFocusInstructions'
import { RECREATE_NO_PLACEHOLDER_RULES, type RecreateBusinessContext } from '@/lib/social/recreateImagePrompt'
import {
  RECREATE_MESSAGE_ANGLE_LABELS,
  type RecreateMessageAngle,
} from '@/lib/social/recreateMessageAngles'
import {
  designedVisualIntentLines,
  designedVisualPromptLines,
  type DesignedResolvedVisual,
} from '@/lib/social/designedVisualInputs'
import {
  aiDesignedIntentById,
  parseDesignedBrief,
  type AiDesignedIntentId,
} from '@/lib/social/designedIntents'

export type DesignedJobContext = {
  title?: string | null
  suburb?: string | null
  state?: string | null
  description?: string | null
}

export const DESIGNED_HARD_COMPLIANCE_RULES = [
  'HARD RULES - do not invent facts. Do not paint contact or commercial numbers on the artwork:',
  'Do NOT invent a logo, emblem, brand mark, logo placeholder, blank logo box, or fake logo badge.',
  'Do NOT invent or render a phone number, website URL, email address, or street address.',
  'Do NOT invent or render rebate figures, prices, dollar amounts, discounts, licence numbers, or business registration numbers.',
  'Do NOT invent ratings, star counts, review quotes, awards, years in business, certifications, or job counts.',
  'Exact contact details and commercial numbers are never created by the image model - even if they appear in the user brief.',
  'If a phone, URL, or address is needed, leave a calm uncluttered area for the existing logo/compositing overlay. Do not write those values yourself.',
] as const

export const DESIGNED_TEXT_DENSITY_RULES = [
  'ON-IMAGE TEXT DISCIPLINE - the graphic must read in about 2-3 seconds:',
  'Use one dominant campaign headline (it may wrap onto two short lines).',
  'Use at most one short supporting statement.',
  'Use one CTA.',
  'The selected logo is applied after generation - do not draw extra brand lockups.',
  'Do not write paragraphs, dense feature lists, unrelated service lists, or multiple competing messages.',
  'Put detailed explanation, rebate amounts, pricing, eligibility fine print, and contact details in the CAPTION, not on the artwork.',
  'For promotional or service posts, use this hierarchy only: Headline → supporting hook → CTA.',
  'Example density for “Sourdough Pre-orders Open for Saturday”:',
  '  FRESH SOURDOUGH',
  '  PRE-ORDERS OPEN FOR SATURDAY',
  '  Baked the morning you collect',
  '  Order Online',
  '  + the selected brand logo (composited later)',
  'Do not add unrelated products or invented contact details to that kind of post.',
] as const

export const DESIGNED_QUALITY_RULES = [
  'Create a complete, professional finished social-media advertisement - not a raw photo, not a stock-photo card, and not a template.',
  'Do NOT produce a dark gradient plus white text card, a generic CTA-pill social layout, or a templated black-scrim overlay look.',
  'Use original composition, strong visual hierarchy, realistic, appetising imagery of the actual products, and a modern branded treatment.',
  'Avoid placing the campaign headline or CTA in the extreme corners of the frame (a small brand mark may be composited later).',
  'Do not leave reserved empty boxes, cutouts, or placeholder panels for branding.',
] as const

export const DESIGNED_SUBJECT_LOCK_RULES = [
  'All three versions must stay on the SAME subject, service, offer, and audience.',
  'Diversity must come from composition, product placement, image crop, headline placement, visual balance, and typography treatment.',
  'Do NOT create diversity by adding extra copy, extra services, or extra messages.',
  'Do NOT drift to a different topic, service, suburb, or campaign.',
] as const

export const DESIGNED_LOGO_SELECTED_RULES = [
  'A real selected logo will be composited after generation. Do not draw any logo.',
  'Do not repeat the business name as a large headline, footer bar, or corner wordmark.',
  'Let the composited logo carry brand identification.',
  'The campaign headline - not the business name - must be the dominant textual element.',
] as const

export const DESIGNED_NO_LOGO_RULES = [
  'No logo will be composited. Do not invent a logo or wordmark.',
  'The business name may appear once as small supporting identity if needed, never as the main campaign headline.',
] as const

export const DESIGNED_ANGLE_DIVERSITY: Record<RecreateMessageAngle, readonly string[]> = {
  bold_direct: [
    'MESSAGING ANGLE: Bold & direct.',
    'Same short copy stack. Stronger visual punch: tighter crop, bolder headline placement, higher-contrast CTA treatment. Do not add extra lines.',
  ],
  helpful_educational: [
    'MESSAGING ANGLE: Helpful & educational.',
    'Same short copy stack unless the user asked for an educational or information-heavy post. Calmer crop and headline placement. Do not add a tip list unless that was explicitly requested.',
  ],
  trust_proof: [
    'MESSAGING ANGLE: Trust & proof.',
    'Same short copy stack. Reassuring imagery and steadier typography. Do not invent proof, ratings, years, or licences. Do not add extra copy.',
  ],
}

const EDUCATIONAL_BRIEF_RE =
  /\b(educational|information[- ]heavy|how it works|tips?|explain|step[- ]by[- ]step)\b/i

export function isInformationHeavyDesignedPost(params: {
  intentChip?: AiDesignedIntentId | null
  userBrief?: string | null
}): boolean {
  if (params.intentChip === 'educational_tips') return true
  return Boolean(params.userBrief && EDUCATIONAL_BRIEF_RE.test(params.userBrief))
}

function formatDesignedBriefLines(raw: string): string[] {
  const structured = structureCampaignFocus(raw)
  return [
    'USER BRIEF (highest creative priority after brand/compliance - honour the SUBJECT in EVERY version):',
    structured.raw,
    'Use the brief for topic and tone. Do not paint every detail from the brief onto the graphic.',
  ]
}

export function buildDesignedImagePrompt(params: {
  business: RecreateBusinessContext
  messageAngle: RecreateMessageAngle
  userBrief?: string | null
  intentChip?: AiDesignedIntentId | null
  job?: DesignedJobContext | null
  visualInputs?: DesignedResolvedVisual[] | null
  /** True when the real selected logo will be composited after generation. */
  applyRealLogo?: boolean
}): string {
  const tradeId = inferCanonicalTrade({
    ai_agent_services: params.business.ai_agent_services,
    name: params.business.name,
  })
  const tradeLabel = tradeId ? formatCanonicalTradeLabel(tradeId) : DEFAULT_BUSINESS_KIND
  const businessName = params.business.name?.trim() || 'Your Business'
  const services = buildServicesSnippet(params.business, 160)
  const suburb = params.business.suburb?.trim()
  const cta = params.business.social_default_cta?.trim()
  const voice = params.business.social_brand_voice?.trim()
  const brandColor = params.business.brand_color?.trim()
  const brandTextColor = params.business.brand_text_color?.trim()
  const parsedFocus = parseDesignedBrief(params.userBrief)
  const userBrief = parsedFocus.ok ? parsedFocus.value : null
  const intent = aiDesignedIntentById(params.intentChip)
  const angleLabel = RECREATE_MESSAGE_ANGLE_LABELS[params.messageAngle]
  const informationHeavy = isInformationHeavyDesignedPost({
    intentChip: params.intentChip,
    userBrief,
  })
  const applyRealLogo = params.applyRealLogo === true

  const lines = [
    `Create a complete original square (1024×1024) social-media advertisement for ${businessName}, a ${tradeLabel} business.`,
    ...DESIGNED_HARD_COMPLIANCE_RULES,
    ...RECREATE_NO_PLACEHOLDER_RULES,
    '',
    ...DESIGNED_TEXT_DENSITY_RULES,
  ]

  if (informationHeavy) {
    lines.push(
      'This request is educational / information-heavy: you may use a little more supporting copy, still no paragraphs, service lists, or contact details.',
    )
  }

  lines.push('')
  lines.push(...DESIGNED_QUALITY_RULES)
  lines.push('')
  lines.push(...(applyRealLogo ? DESIGNED_LOGO_SELECTED_RULES : DESIGNED_NO_LOGO_RULES))
  lines.push('')
  lines.push(...DESIGNED_SUBJECT_LOCK_RULES)

  if (userBrief) {
    lines.push('')
    lines.push(...formatDesignedBriefLines(userBrief))
  }

  if (intent) {
    lines.push('')
    lines.push('MESSAGING INTENT (optional chip - do not invent a category subtype or extra offer):')
    lines.push(`- ${intent.label}`)
    if (!userBrief) {
      lines.push(
        `- Use this as the subject: ${intent.starter.trim()} (complete with the business's real services only, without listing them on the graphic).`,
      )
    }
  }

  lines.push('')
  lines.push(...DESIGNED_ANGLE_DIVERSITY[params.messageAngle])
  lines.push(`- Angle label: ${angleLabel}`)

  lines.push('')
  lines.push(
    'Business profile (identity and imagery context only - never paint phone, URL, email, address, prices, rebates, or licence numbers):',
  )
  lines.push(`- Business name: ${businessName}`)
  lines.push(`- Business type: ${tradeLabel}`)
  if (services) {
    lines.push(`- What they sell (for subject/imagery only - do not list them on the graphic): ${services}`)
  }
  if (suburb) lines.push(`- Location (for scene/setting only): ${suburb}`)
  if (voice) lines.push(`- Brand voice: ${voice}`)
  if (brandColor) lines.push(`- Brand colour: ${brandColor}`)
  if (brandTextColor) lines.push(`- Brand text colour: ${brandTextColor}`)
  if (cta) {
    lines.push(`- Preferred CTA wording (use as the single CTA, or a close short variant): ${cta}`)
  }

  const job = params.job
  if (job && (job.title?.trim() || job.suburb?.trim() || job.description?.trim())) {
    lines.push('')
    lines.push(
      'Featured product / offer (imagery/subject only - do not turn this into body copy or a product list):',
    )
    if (job.title?.trim()) lines.push(`- Product or offer: ${job.title.trim()}`)
    const loc = [job.suburb?.trim(), job.state?.trim()].filter(Boolean).join(', ')
    if (loc) lines.push(`- Suburb: ${loc}`)
    if (job.description?.trim()) lines.push(`- Description: ${job.description.trim()}`)
  }

  const visuals = params.visualInputs ?? []
  if (visuals.length) {
    lines.push('')
    lines.push(...designedVisualPromptLines(visuals))
    lines.push(...designedVisualIntentLines(params.intentChip))
    lines.push(
      'The business logo is composited later and is not one of these supplied visuals. Do not invent a logo from the references.',
    )
    lines.push(
      'Output a finished 1:1 advertisement using the attached reference images as specified. Do not leave empty logo holes. Do not render contact details.',
    )
  } else {
    lines.push('')
    lines.push(
      'Output a finished 1:1 advertisement. No reference image is provided. Do not leave empty logo holes. Do not render contact details.',
    )
  }

  return lines.join('\n')
}
