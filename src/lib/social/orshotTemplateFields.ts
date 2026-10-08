/**
 * Fetch Orshot studio template metadata and map parameterized elements
 * to StitchedUp TemplateField[] for social_style_templates.fields.
 *
 * @see https://orshot.com/docs/api-reference/studio-template-get
 */

import type { StyleTemplateSpec } from './styleTemplateCatalog'
import { STYLE_TEMPLATE_CATALOG, whereClauseForSpec } from './styleTemplateCatalog'
import type { TemplateField, TemplateFieldSource } from './templateFields'

export const ORSHOT_TEMPLATE_GET_URL = 'https://api.orshot.com/v1/studio/templates'

export interface OrshotModification {
  key:           string
  id:            string
  type:          string
  description?:  string
  help_text?:    string
  element_name?: string
  example?:      string
  page_number?:  number
  page_id?:      string
}

export interface OrshotTemplateResponse {
  id:             number
  name:           string
  modifications?: OrshotModification[]
}

export interface TemplateFieldSyncResult {
  spec:           StyleTemplateSpec
  fields:         TemplateField[]
  skippedMods:    Array<{ key: string; type: string; reason: string }>
  orshotModCount: number
}

const PHOTO_TYPES = new Set(['imageurl', 'videourl'])
const TEXT_TYPES  = new Set(['text'])
const SKIP_TYPES  = new Set(['backgroundcolor', 'fill', 'color', 'stroke'])

const SOURCE_BY_NORMALIZED_KEY: Record<string, TemplateFieldSource> = {
  headline:      'businessName',
  title:         'businessName',
  businessname:  'businessName',
  business_name: 'businessName',
  company:       'businessName',
  companyname:   'businessName',
  description:   'jobDescription',
  desc:          'jobDescription',
  body:          'jobDescription',
  tagline:       'tagline',
  subtitle:      'tagline',
  website:       'website',
  web:           'website',
  url:           'website',
  social:        'socialHandle',
  socialhandle:  'socialHandle',
  instagram:     'socialHandle',
  handle:        'socialHandle',
  phone:         'businessPhone',
  tel:           'businessPhone',
  mobile:        'businessPhone',
  telephone:     'businessPhone',
}

const MAX_LENGTH_BY_KEY: Record<string, number> = {
  headline:    60,
  title:       60,
  description: 120,
  desc:        120,
  body:        120,
  tagline:     50,
  subtitle:    50,
  service1:    40,
  service2:    40,
  service3:    40,
  service4:    40,
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

/** Strip Orshot multi-page prefix e.g. page1@headline → headline */
export function extractOrshotFieldKey(modKey: string): string {
  const trimmed = modKey.trim()
  const at = trimmed.indexOf('@')
  if (at >= 0) return trimmed.slice(at + 1)
  return trimmed
}

function humanizeKey(key: string): string {
  const cleaned = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/(\d+)/g, ' $1 ')
    .trim()
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function inferFieldLabel(mod: OrshotModification): string {
  const elementName = mod.element_name?.trim()
  if (elementName) return elementName

  const desc = mod.description?.trim()
  if (desc) {
    const dash = desc.indexOf(' - ')
    if (dash >= 0) return desc.slice(0, dash).trim()
    return desc
  }

  return humanizeKey(extractOrshotFieldKey(mod.key))
}

export function inferFieldSource(fieldKey: string): TemplateFieldSource | undefined {
  return SOURCE_BY_NORMALIZED_KEY[normalizeKey(fieldKey)]
}

export function orshotModToTemplateField(mod: OrshotModification): TemplateField | null {
  const typeNorm = mod.type.trim().toLowerCase()
  if (SKIP_TYPES.has(typeNorm)) return null

  const fieldKey = extractOrshotFieldKey(mod.key || mod.id)
  if (!fieldKey) return null

  let fieldType: 'text' | 'photo'
  if (PHOTO_TYPES.has(typeNorm)) {
    fieldType = 'photo'
  } else if (TEXT_TYPES.has(typeNorm)) {
    fieldType = 'text'
  } else {
    // User rule: everything else → text (style params included if not skipped above)
    fieldType = 'text'
  }

  const field: TemplateField = {
    key:   fieldKey,
    label: inferFieldLabel(mod),
    type:  fieldType,
  }

  const source = inferFieldSource(fieldKey)
  if (source && fieldType === 'text') field.source = source

  const maxLength = MAX_LENGTH_BY_KEY[normalizeKey(fieldKey)]
  if (maxLength && fieldType === 'text') field.maxLength = maxLength

  return field
}

export function filterModificationsForPage(
  modifications: OrshotModification[],
  page: number | null,
): OrshotModification[] {
  const targetPage = page ?? 1
  return modifications.filter((mod) => {
    const modPage = mod.page_number ?? 1
    return modPage === targetPage
  })
}

export function buildFieldsFromModifications(
  modifications: OrshotModification[],
  page: number | null,
): { fields: TemplateField[]; skipped: Array<{ key: string; type: string; reason: string }> } {
  const pageMods = filterModificationsForPage(modifications, page)
  const fields: TemplateField[] = []
  const skipped: Array<{ key: string; type: string; reason: string }> = []
  const seenKeys = new Set<string>()

  for (const mod of pageMods) {
    const typeNorm = mod.type.trim().toLowerCase()
    if (SKIP_TYPES.has(typeNorm)) {
      skipped.push({ key: mod.key, type: mod.type, reason: 'style-only (skipped)' })
      continue
    }

    const field = orshotModToTemplateField(mod)
    if (!field) {
      skipped.push({ key: mod.key, type: mod.type, reason: 'unmapped' })
      continue
    }

    if (seenKeys.has(field.key)) {
      skipped.push({ key: mod.key, type: mod.type, reason: `duplicate key "${field.key}"` })
      continue
    }
    seenKeys.add(field.key)
    fields.push(field)
  }

  return { fields, skipped }
}

/** Orshot GET /v1/studio/templates/:id - 30 requests/min per API key. */
export const ORSHOT_TEMPLATE_RATE_LIMIT_PER_MIN = 30

export interface FetchOrshotBatchOptions {
  /** Parallel requests per batch (default 5). */
  batchSize?:     number
  /** Pause between batches in ms (default 11000 - keeps bursts under 30/min). */
  batchDelayMs?:  number
  /** Retries on HTTP 429 (default 3). */
  maxRetries?:    number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class OrshotFetchError extends Error {
  constructor(
    message: string,
    readonly templateId: string | number,
    readonly status: number,
    readonly retryAfterSec?: number,
  ) {
    super(message)
    this.name = 'OrshotFetchError'
  }
}

export async function fetchOrshotTemplate(
  apiKey: string,
  templateId: string | number,
): Promise<OrshotTemplateResponse> {
  const res = await fetch(`${ORSHOT_TEMPLATE_GET_URL}/${templateId}`, {
    method:  'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${apiKey.trim()}`,
    },
  })

  const rawText = await res.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new OrshotFetchError(
      `Orshot template ${templateId} returned non-JSON (${res.status})`,
      templateId,
      res.status,
    )
  }

  if (!res.ok) {
    const msg =
      (parsed as { message?: string })?.message ??
      (parsed as { error?: string })?.error ??
      rawText.slice(0, 300)
    const retryAfterHeader = res.headers.get('Retry-After')
    const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : undefined
    throw new OrshotFetchError(
      `Orshot template ${templateId} fetch failed (${res.status}): ${msg}`,
      templateId,
      res.status,
      Number.isFinite(retryAfterSec) ? retryAfterSec : undefined,
    )
  }

  return parsed as OrshotTemplateResponse
}

export async function fetchOrshotTemplateWithRetry(
  apiKey: string,
  templateId: string | number,
  maxRetries = 3,
): Promise<OrshotTemplateResponse> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchOrshotTemplate(apiKey, templateId)
    } catch (err) {
      const is429 = err instanceof OrshotFetchError && err.status === 429
      if (!is429 || attempt === maxRetries) throw err

      const retryAfterSec = err.retryAfterSec ?? 5 * (attempt + 1)
      const waitMs = Math.max(retryAfterSec * 1000, 5000)
      console.warn(
        `[Orshot] Rate limited on template ${templateId}, retry ${attempt + 1}/${maxRetries} in ${waitMs}ms`,
      )
      await sleep(waitMs)
    }
  }

  throw new Error(`Orshot template ${templateId}: retries exhausted`)
}

/**
 * Fetch many unique templates using parallel batches + inter-batch delay
 * to stay under Orshot's 30 req/min limit while finishing faster than
 * fully sequential calls.
 */
export async function fetchAllOrshotTemplates(
  apiKey: string,
  templateIds: string[],
  options: FetchOrshotBatchOptions = {},
): Promise<Map<string, OrshotTemplateResponse>> {
  const batchSize    = options.batchSize ?? 5
  const batchDelayMs = options.batchDelayMs ?? 11_000
  const maxRetries   = options.maxRetries ?? 3
  const cache        = new Map<string, OrshotTemplateResponse>()
  const uniqueIds    = [...new Set(templateIds)]

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map((id) => fetchOrshotTemplateWithRetry(apiKey, id, maxRetries)),
    )
    batch.forEach((id, idx) => cache.set(id, results[idx]))

    if (i + batchSize < uniqueIds.length && batchDelayMs > 0) {
      await sleep(batchDelayMs)
    }
  }

  return cache
}

export async function syncAllTemplateFields(
  apiKey: string,
  catalog = STYLE_TEMPLATE_CATALOG,
  fetchOptions?: FetchOrshotBatchOptions,
): Promise<TemplateFieldSyncResult[]> {
  const templateIds = [...new Set(catalog.map((t) => t.orshot_template_id))]
  const orshotCache = await fetchAllOrshotTemplates(apiKey, templateIds, fetchOptions)

  return catalog.map((spec) => {
    const orshot = orshotCache.get(spec.orshot_template_id)
    const modifications = orshot?.modifications ?? []
    const { fields, skipped } = buildFieldsFromModifications(modifications, spec.orshot_page)

    return {
      spec,
      fields,
      skippedMods:    skipped,
      orshotModCount: filterModificationsForPage(modifications, spec.orshot_page).length,
    }
  })
}

export function formatFieldsSummary(fields: TemplateField[]): string {
  return fields.map((f) => {
    const parts = [f.key, f.type]
    if (f.source) parts.push(`→${f.source}`)
    return parts.join(':')
  }).join(', ')
}

export function buildMigrationSql(results: TemplateFieldSyncResult[]): string {
  const lines: string[] = [
    '-- Auto-generated from Orshot GET /v1/studio/templates/:id',
    '-- Run scripts/fetch-orshot-template-fields.ts to regenerate.',
    '',
  ]

  for (const { spec, fields } of results) {
    const json = JSON.stringify(fields)
    const escaped = json.replace(/'/g, "''")
    lines.push(`-- ${spec.name} (Orshot ${spec.orshot_template_id}${spec.orshot_page != null ? ` p${spec.orshot_page}` : ''})`)
    lines.push(`UPDATE social_style_templates`)
    lines.push(`SET fields = '${escaped}'::jsonb`)
    lines.push(`WHERE is_active = true AND ${whereClauseForSpec(spec)};`)
    lines.push('')
  }

  return lines.join('\n')
}

export function buildMarkdownReport(results: TemplateFieldSyncResult[]): string {
  const lines: string[] = [
    '# Orshot template fields sync report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Template | Orshot ID | Page | Fields detected |',
    '|----------|-----------|------|-----------------|',
  ]

  for (const { spec, fields, skippedMods } of results) {
    const page = spec.orshot_page ?? '-'
    const summary = fields.length > 0
      ? fields.map((f) => `\`${f.key}\` (${f.type}${f.source ? `, ${f.source}` : ''})`).join(', ')
      : '⚠️ _none_'
    lines.push(`| ${spec.name} | ${spec.orshot_template_id} | ${page} | ${summary} |`)

    if (skippedMods.length > 0) {
      lines.push(`| ↳ skipped | | | ${skippedMods.map((s) => `\`${s.key}\` (${s.reason})`).join(', ')} |`)
    }
  }

  lines.push('')
  lines.push('## Field detail by template')
  lines.push('')

  for (const { spec, fields } of results) {
    lines.push(`### ${spec.name}`)
    lines.push('')
    if (fields.length === 0) {
      lines.push('_No content fields detected._')
    } else {
      lines.push('| Key | Label | Type | Source | Max |')
      lines.push('|-----|-------|------|--------|-----|')
      for (const f of fields) {
        lines.push(`| ${f.key} | ${f.label} | ${f.type} | ${f.source ?? '-'} | ${f.maxLength ?? '-'} |`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}
