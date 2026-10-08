import { formatTradeCategoryLabel } from '@/lib/social/inferTradeCategory'
import type { AiImageMode } from '@/lib/social/aiImageStyles'

function truncateText(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max)
}

export function buildServicesSnippet(
  business: {
    ai_agent_services?: string | null
    social_default_cta?:  string | null
  },
  maxLength = 100,
): string | null {
  const services = business.ai_agent_services?.trim()
  if (services) return truncateText(services, maxLength)
  const cta = business.social_default_cta?.trim()
  if (cta) return truncateText(cta, maxLength)
  return null
}

export function buildAiImagePrompt(
  params: {
    styleFragment:   string
    sceneFragment:   string
    tradeCategory:   string
    businessName?:   string | null
    servicesSnippet?: string | null
    tagline?:         string | null
    jobDescription?: string | null
    brandColor?:     string | null
    extraDetail?:    string | null
  },
  mode: AiImageMode = 'photo',
): string {
  const tradeLabel =
    formatTradeCategoryLabel(params.tradeCategory) ||
    params.tradeCategory.replace(/_/g, ' ')

  const services = params.servicesSnippet?.trim()

  if (mode === 'full_post') {
    const businessName = params.businessName?.trim() || 'Your Business'
    const parts = [
      params.styleFragment,
      params.sceneFragment,
      services
        ? `for ${businessName}, a ${tradeLabel} business specialising in ${services}`
        : `for ${businessName}, a ${tradeLabel} business`,
      `Include the text '${businessName}' prominently and tastefully integrated into the design`,
    ]
    const tagline = params.tagline?.trim()
    if (tagline) parts.push(tagline)
    const jobDesc = params.jobDescription?.trim()
    if (jobDesc) parts.push(jobDesc)
    parts.push('The visual scene should reflect what this business actually does.')
    parts.push(
      'Do not render a logo, brand mark, or watermark - the real business logo is added separately after generation.',
    )
    const extra = params.extraDetail?.trim()
    if (extra) parts.push(`Additional creative detail: ${extra}`)
    parts.push('Professional social media graphic, square format, polished finished design.')
    return parts.join('. ').replace(/\.\s+\./g, '. ')
  }

  const parts = [
    params.styleFragment,
    params.sceneFragment,
    services
      ? `for a ${tradeLabel} business that offers ${services}`
      : `for a ${tradeLabel} business`,
  ]

  const jobDesc = params.jobDescription?.trim()
  if (jobDesc) parts.push(jobDesc)

  const brand = params.brandColor?.trim()
  if (brand) {
    parts.push(`incorporate brand accent colour ${brand} subtly in the composition`)
  }

  parts.push(
    'The scene should visually reflect the specific services this business offers - show relevant equipment, settings, or work context, not generic trade imagery.',
  )
  const extra = params.extraDetail?.trim()
  if (extra) parts.push(`Additional creative detail: ${extra}`)
  parts.push(
    'Professional, high quality, no text overlay, no watermarks, no logos, no readable text of any kind.',
  )

  return parts.join('. ').replace(/\.\s+\./g, '. ')
}

const BASELINE_SAFETY_INSTRUCTIONS = [
  'Professional, high quality image suitable for a trades business social media post.',
  'No watermarks.',
  'No offensive, inappropriate, violent, or adult content.',
] as const

/** Wrap user-authored prompt with baseline quality and safety instructions - never sent raw to OpenAI. */
export function buildCustomAiImagePrompt(
  params: {
    customPrompt:     string
    tradeCategory?:   string
    businessName?:    string | null
    servicesSnippet?: string | null
    jobDescription?:  string | null
    brandColor?:      string | null
  },
  mode: AiImageMode = 'photo',
): string {
  const userText = params.customPrompt.trim()
  const tradeLabel =
    formatTradeCategoryLabel(params.tradeCategory ?? '') ||
    params.tradeCategory?.replace(/_/g, ' ') ||
    'trade'
  const services = params.servicesSnippet?.trim()

  if (mode === 'full_post') {
    const businessName = params.businessName?.trim() || 'Your Business'
    const parts = [
      userText,
      services
        ? `Designed for ${businessName}, a ${tradeLabel} business specialising in ${services}`
        : `Designed for ${businessName}, a ${tradeLabel} business`,
      'Do not render a logo, brand mark, or watermark - the real business logo is added separately after generation.',
      'Professional social media graphic, square format, polished finished design.',
      ...BASELINE_SAFETY_INSTRUCTIONS,
    ]
    const jobDesc = params.jobDescription?.trim()
    if (jobDesc) parts.push(jobDesc)
    const brand = params.brandColor?.trim()
    if (brand) {
      parts.push(`incorporate brand accent colour ${brand} subtly in the composition`)
    }
    return parts.join('. ').replace(/\.\s+\./g, '. ')
  }

  const parts = [
    userText,
    ...BASELINE_SAFETY_INSTRUCTIONS,
    'No text overlay, no logos, no readable text of any kind.',
  ]

  const brand = params.brandColor?.trim()
  if (brand) {
    parts.push(`incorporate brand accent colour ${brand} subtly in the composition`)
  }

  return parts.join('. ').replace(/\.\s+\./g, '. ')
}

/** Default OpenAI image model - override via OPENAI_IMAGE_MODEL env. */
export const DEFAULT_OPENAI_IMAGE_MODEL = 'gpt-image-1'
