import type { SocialTextStyles } from '@/lib/social/socialTextStyle'

export type TemplateFieldType = 'text' | 'photo'

export type TemplateFieldSource =
  | 'businessName'
  | 'jobDescription'
  | 'tagline'
  | 'website'
  | 'socialHandle'
  | 'businessPhone'

export interface TemplateField {
  key:        string
  label:      string
  type:       TemplateFieldType
  maxLength?: number
  source?:    TemplateFieldSource
}

/** Default fields - must match migration 067 column default. */
export const DEFAULT_TEMPLATE_FIELDS: TemplateField[] = [
  { key: 'headline',    label: 'Business name', type: 'text', maxLength: 60,  source: 'businessName' },
  { key: 'description', label: 'Description',     type: 'text', maxLength: 120, source: 'jobDescription' },
  { key: 'tagline',     label: 'Tagline',         type: 'text', maxLength: 50,  source: 'tagline' },
  { key: 'website',     label: 'Website',         type: 'text',                  source: 'website' },
  { key: 'social',      label: 'Social handle',   type: 'text',                  source: 'socialHandle' },
  { key: 'service1',    label: 'Service 1',       type: 'text', maxLength: 40 },
  { key: 'service2',    label: 'Service 2',       type: 'text', maxLength: 40 },
  { key: 'phone',       label: 'Phone',           type: 'text',                  source: 'businessPhone' },
  { key: 'photo',       label: 'Photo',           type: 'photo' },
]

export interface FieldSourceJob {
  title?:       string | null
  site_suburb?: string | null
}

export interface FieldSourceBusiness {
  name?:                string | null
  phone?:               string | null
  website?:             string | null
  instagram_username?:  string | null
  facebook_page_name?:  string | null
  ai_agent_services?:   string | null
  social_default_cta?:  string | null
}

export interface FieldSourceContext {
  business: FieldSourceBusiness
  job?:     FieldSourceJob | null
  /** Client-side job description fallback when no job selected. */
  servicesFallback?: string | null
}

function truncateText(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max)
}

function formatSocialHandle(business: FieldSourceBusiness): string {
  const ig = business.instagram_username?.trim()
  if (ig) return ig.replace(/^@/, '')
  return business.facebook_page_name?.trim() || ''
}

/** Mirrors server resolveDefaultTagline - services then social_default_cta. */
export function resolveDefaultTagline(business: FieldSourceBusiness): string {
  const services = business.ai_agent_services?.trim()
  if (services) return truncateText(services, 50)
  const cta = business.social_default_cta?.trim()
  if (cta) return truncateText(cta, 50)
  return ''
}

export function resolveJobDescription(
  job: FieldSourceJob | null | undefined,
  servicesFallback?: string | null,
): string {
  if (job?.title?.trim()) {
    const suburb = job.site_suburb?.trim()
    const text = suburb ? `${job.title} - ${suburb}` : job.title
    return truncateText(text, 120)
  }
  if (servicesFallback?.trim()) return truncateText(servicesFallback.trim(), 120)
  return ''
}

export function resolveFieldSource(
  source: TemplateFieldSource,
  ctx: FieldSourceContext,
): string {
  const { business, job, servicesFallback } = ctx
  switch (source) {
    case 'businessName':
      return business.name?.trim() || ''
    case 'jobDescription':
      return resolveJobDescription(job, servicesFallback ?? business.ai_agent_services)
    case 'tagline':
      return resolveDefaultTagline(business)
    case 'website':
      return business.website?.trim() || ''
    case 'socialHandle':
      return formatSocialHandle(business)
    case 'businessPhone':
      return business.phone?.trim() || ''
    default:
      return ''
  }
}

function isValidFieldType(value: unknown): value is TemplateFieldType {
  return value === 'text' || value === 'photo'
}

const VALID_SOURCES = new Set<string>([
  'businessName',
  'jobDescription',
  'tagline',
  'website',
  'socialHandle',
  'businessPhone',
])

function parseField(raw: unknown): TemplateField | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const key = typeof obj.key === 'string' ? obj.key.trim() : ''
  const label = typeof obj.label === 'string' ? obj.label.trim() : ''
  if (!key || !label || !isValidFieldType(obj.type)) return null

  const field: TemplateField = { key, label, type: obj.type }
  if (typeof obj.maxLength === 'number' && Number.isFinite(obj.maxLength) && obj.maxLength > 0) {
    field.maxLength = Math.round(obj.maxLength)
  }
  if (typeof obj.source === 'string' && VALID_SOURCES.has(obj.source)) {
    field.source = obj.source as TemplateFieldSource
  }
  return field
}

export function parseTemplateFields(raw: unknown): TemplateField[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_TEMPLATE_FIELDS]
  const parsed = raw.map(parseField).filter((f): f is TemplateField => f != null)
  if (parsed.length === 0) return [...DEFAULT_TEMPLATE_FIELDS]

  const seen = new Set<string>()
  const deduped: TemplateField[] = []
  for (const field of parsed) {
    if (seen.has(field.key)) continue
    seen.add(field.key)
    deduped.push(field)
  }
  return deduped
}

export function buildDefaultFieldValues(
  fields: TemplateField[],
  ctx: FieldSourceContext,
): Record<string, string> {
  const values: Record<string, string> = {}
  for (const field of fields) {
    let value = field.source ? resolveFieldSource(field.source, ctx) : ''
    if (field.type === 'text' && field.maxLength && value) {
      value = truncateText(value, field.maxLength)
    }
    values[field.key] = value
  }
  return values
}

/** Merge user overrides with source fallbacks for each template field. */
export function resolveTemplateFieldValues(
  fields: TemplateField[],
  ctx: FieldSourceContext,
  overrides?: Record<string, string | null | undefined> | null,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const field of fields) {
    const override = overrides?.[field.key]?.trim()
    let value = override || (field.source ? resolveFieldSource(field.source, ctx) : '')
    if (field.type === 'text' && field.maxLength && value) {
      value = truncateText(value, field.maxLength)
    }
    if (value) result[field.key] = value
  }
  return result
}

export function hasRequiredFieldValues(
  fields: TemplateField[],
  fieldValues: Record<string, string>,
): boolean {
  const headlineField = fields.find((f) => f.key === 'headline' && f.type === 'text')
  if (headlineField) return !!fieldValues.headline?.trim()

  const firstText = fields.find((f) => f.type === 'text')
  if (firstText) return !!fieldValues[firstText.key]?.trim()

  return fields.length > 0
}

export function orshotParamKey(page: number, fieldKey: string): string {
  return `page${page}@${fieldKey}`
}

const TEXT_STYLE_KEYS = ['headline', 'description', 'tagline'] as const

export function buildOrshotFieldModifications(
  page: number,
  fields: TemplateField[],
  fieldValues: Record<string, string>,
  options?: {
    textStyles?: SocialTextStyles
    logoUrl?:    string
  },
): Record<string, string> {
  const mods: Record<string, string> = {}

  for (const field of fields) {
    const value = fieldValues[field.key]?.trim()
    if (!value) continue
    mods[orshotParamKey(page, field.key)] = value
  }

  const logoUrl = options?.logoUrl?.trim()
  if (logoUrl && !fields.some((f) => f.key === 'logo')) {
    mods[orshotParamKey(page, 'logo')] = logoUrl
  }

  const textStyles = options?.textStyles
  if (textStyles) {
    for (const key of TEXT_STYLE_KEYS) {
      if (!fields.some((f) => f.key === key)) continue
      const paramKey = orshotParamKey(page, key)
      const el = textStyles[key]
      mods[`${paramKey}.fontFamily`] = el.fontFamily
      mods[`${paramKey}.fontSize`]   = `${el.fontSize}px`
      mods[`${paramKey}.color`]      = el.color
    }
  }

  return mods
}

/** Sample values for style preview thumbnails. */
export const SAMPLE_PREVIEW_FIELD_VALUES: Record<string, string> = {
  headline:    'Your Business Name',
  description: 'Professional trade services',
  tagline:     'Licensed & insured',
  website:     'www.yourbusiness.com.au',
  social:      'yourbusiness',
}

export function samplePreviewFieldValues(fields: TemplateField[]): Record<string, string> {
  const values: Record<string, string> = {}
  for (const field of fields) {
    if (field.type === 'photo') continue
    const sample = SAMPLE_PREVIEW_FIELD_VALUES[field.key]
    if (sample) values[field.key] = sample
  }
  return values
}
