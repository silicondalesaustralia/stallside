import {
  aiDesignedIntentById,
  parseAiDesignedIntentChip,
  type AiDesignedIntentId,
} from '@/lib/social/designedIntents'
import {
  isRecreateMessageAngle,
  RECREATE_MESSAGE_ANGLE_LABELS,
  type RecreateMessageAngle,
} from '@/lib/social/recreateMessageAngles'
import { VENDL_SOCIAL_AUDIENCE } from '@/lib/socialHost/socialAudience'

export type DesignedCaptionMeta = {
  userBrief: string | null
  messageAngle: RecreateMessageAngle | null
  intentChip: AiDesignedIntentId | null
  jobId: string | null
  generationMode: 'ai_designed' | null
  generationSource: string | null
}

export type DesignedCaptionBusiness = {
  name: string
  services: string | null
  suburb: string | null
  brandVoice: string | null
  cta: string | null
  phone: string | null
  website: string | null
}

export type DesignedCaptionJob = {
  title: string | null
  description: string | null
  suburb: string | null
  state: string | null
}

export type DesignedCaptionUiState = {
  showGenerate: boolean
  showCopy: boolean
  showRegenerate: boolean
  showEditor: boolean
}

const COMPLETED_INTENTS = new Set<AiDesignedIntentId>(['completed_job'])
const PROMOTIONAL_INTENTS = new Set<AiDesignedIntentId>([
  'promote_service',
  'offer_promotion',
])

export function resolveCaptionGenerationMode(content: unknown): 'ai_designed' | 'legacy' {
  return designedMetaFromContent(content) ? 'ai_designed' : 'legacy'
}

export function designedMetaFromContent(content: unknown): DesignedCaptionMeta | null {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return null
  const raw = (content as Record<string, unknown>)._designed
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const row = raw as Record<string, unknown>
  if (row.generationMode !== 'ai_designed' && row.visualPath !== 'ai_designed') {
    return null
  }
  const brief = typeof row.userBrief === 'string' ? row.userBrief.trim() : ''
  const source = typeof row.generationSource === 'string' ? row.generationSource.trim() : ''
  const jobId = typeof row.jobId === 'string' && row.jobId.trim() ? row.jobId.trim() : null
  return {
    userBrief: brief || null,
    messageAngle: isRecreateMessageAngle(row.messageAngle) ? row.messageAngle : null,
    intentChip: parseAiDesignedIntentChip(row.intentChip),
    jobId,
    generationMode: 'ai_designed',
    generationSource: source || 'ai_designed_scratch',
  }
}

export function isCompletedJobDesignedIntent(chip: AiDesignedIntentId | null): boolean {
  return chip != null && COMPLETED_INTENTS.has(chip)
}

export function isPromotionalDesignedIntent(
  chip: AiDesignedIntentId | null,
  userBrief: string | null,
): boolean {
  if (chip && PROMOTIONAL_INTENTS.has(chip)) return true
  return /\b(promote|promotion|offer|special|sale|discount|pre-?orders?)\b/i.test(userBrief ?? '')
}

export function designedCaptionUiState(caption: string | null | undefined): DesignedCaptionUiState {
  const hasCaption = Boolean(caption?.trim())
  return {
    showGenerate: !hasCaption,
    showCopy: hasCaption,
    showRegenerate: hasCaption,
    showEditor: hasCaption,
  }
}

export function countCaptionHashtags(text: string): number {
  const matches = text.match(/(^|\s)#[A-Za-z0-9_]+/g)
  return matches?.length ?? 0
}

export function captionLooksGenericPlumbingFallback(text: string): boolean {
  return /top-notch plumbing job|another top-notch|wrapped up another/i.test(text)
}

const ANGLE_STYLE: Record<RecreateMessageAngle, string> = {
  bold_direct: 'Concise, benefit-led, stronger CTA.',
  helpful_educational: 'Explain the value and why it matters. Useful and customer-friendly. Softer CTA.',
  trust_proof:
    'Quality, care and freshness. Use only factual proof from the brief, product, or business data.',
}

export function buildDesignedCaptionPrompt(params: {
  designed: DesignedCaptionMeta
  business: DesignedCaptionBusiness
  job: DesignedCaptionJob | null
}): { system: string; user: string } {
  const { designed, business, job } = params
  const intent = aiDesignedIntentById(designed.intentChip)
  const completed = isCompletedJobDesignedIntent(designed.intentChip)
  const promotional = isPromotionalDesignedIntent(designed.intentChip, designed.userBrief)
  const angle = designed.messageAngle
  const jobSuburb = job?.suburb?.trim() || null
  const jobState = job?.state?.trim() || null
  const bizSuburb = business.suburb?.trim() || null

  const system = [
    `You write ready-to-post social captions for ${VENDL_SOCIAL_AUDIENCE}`,
    'Return ONE caption only. Do not number options. Do not use markdown headings.',
    'Write about the requested subject. Do not replace it with generic business assumptions.',
    'Do not invent reviews, ratings, awards, years in business, certifications, discounts, prices, dates, or guarantees unless they appear in the original brief or trusted product/business data.',
    'Complement the image. Do not repeat a full headline stack word-for-word.',
    'Short natural paragraphs. Avoid generic AI filler such as "top-notch", "another great job", or "we\'re thrilled".',
    'One natural CTA. 3 to 6 relevant hashtags. No huge hashtag blocks.',
    'About 60-140 words depending on angle. Do not pad.',
  ].join(' ')

  const lines: string[] = []
  lines.push('Write a caption using this priority order (highest first):')
  lines.push('1. Original user brief')
  lines.push('2. Messaging angle')
  lines.push('3. Intent')
  lines.push('4. Product / offer context')
  lines.push('5. Trusted business context')
  lines.push('6. Generic fallback only if none of the above exist')
  lines.push('')
  lines.push('AI DESIGNED ORIGINAL BRIEF:')
  lines.push(designed.userBrief || '(none)')
  lines.push('')
  lines.push('MESSAGE ANGLE:')
  if (angle) {
    lines.push(`${RECREATE_MESSAGE_ANGLE_LABELS[angle]} (${angle})`)
    lines.push(ANGLE_STYLE[angle])
  } else {
    lines.push('(none)')
  }
  lines.push('')
  lines.push('INTENT:')
  lines.push(intent ? `${intent.label} (${intent.id})` : '(none)')
  if (completed) {
    lines.push(
      'This is a fresh-batch / ready-now update. Sound like it is ready to order or collect. Mention suburb only if provided below.',
    )
  } else if (promotional) {
    lines.push(
      'This is promotional. Expand on the product, customer benefit, and any offer that appears in the brief or product details. Do not invent a discount amount.',
    )
  }
  lines.push('')
  lines.push('PRODUCT / OFFER CONTEXT:')
  if (job && (job.title?.trim() || job.description?.trim() || jobSuburb)) {
    if (job.title?.trim()) lines.push(`- Product or offer: ${job.title.trim()}`)
    if (jobSuburb) {
      lines.push(`- Suburb: ${jobSuburb}${jobState ? `, ${jobState}` : ''}`)
    } else {
      lines.push('- Suburb: (unknown - do not invent a suburb)')
    }
    if (job.description?.trim()) lines.push(`- Details (prices, dates, contents): ${job.description.trim()}`)
  } else {
    lines.push('(none)')
  }
  lines.push('')
  lines.push('BUSINESS CONTEXT:')
  lines.push(`- Business name: ${business.name}`)
  if (business.services?.trim()) lines.push(`- Business type: ${business.services.trim()}`)
  if (bizSuburb) lines.push(`- Location: ${bizSuburb}`)
  if (business.brandVoice?.trim()) lines.push(`- Brand voice: ${business.brandVoice.trim()}`)
  if (business.cta?.trim()) lines.push(`- Default CTA: ${business.cta.trim()}`)
  if (business.phone?.trim()) lines.push(`- Phone: ${business.phone.trim()}`)
  if (business.website?.trim()) lines.push(`- Website: ${business.website.trim()}`)
  lines.push('')
  lines.push('IMPORTANT:')
  lines.push('Write about the requested subject above.')
  lines.push('Do not replace it with generic business/service assumptions.')

  return { system, user: lines.join('\n') }
}

export function mockDesignedCaption(params: {
  designed: DesignedCaptionMeta
  business: DesignedCaptionBusiness
  job: DesignedCaptionJob | null
}): string {
  const brief = params.designed.userBrief?.trim()
  const subject =
    brief ||
    params.job?.title?.trim() ||
    aiDesignedIntentById(params.designed.intentChip)?.label ||
    params.business.services?.trim() ||
    params.business.name
  const suburb = params.job?.suburb?.trim()
  const completed = isCompletedJobDesignedIntent(params.designed.intentChip)
  const promotional = isPromotionalDesignedIntent(
    params.designed.intentChip,
    params.designed.userBrief,
  )
  const cta = params.business.cta?.trim() || `Order from ${params.business.name}`
  const lead = completed
    ? suburb
      ? `Fresh and ready in ${suburb}.`
      : 'Fresh and ready.'
    : subject
  const mid = completed
    ? brief
      ? brief
      : 'Made with care, in small batches, by a local producer.'
    : promotional
      ? 'A good one to grab while it lasts.'
      : 'Here is what makes it worth ordering.'
  const tags = '#ShopLocal #SupportLocal #FreshLocal'
  return `${lead}\n\n${mid}\n\n${cta}\n\n${tags}`
}
