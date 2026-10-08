/**
 * Orshot Studio render helper - Phase 8.
 * @see https://orshot.com/docs/api-reference/render-from-studio-template
 */

import type { SocialTextStyles } from '@/lib/social/socialTextStyle'
import {
  buildOrshotFieldModifications,
  parseTemplateFields,
  type TemplateField,
} from '@/lib/social/templateFields'

export const ORSHOT_RENDER_URL = 'https://api.orshot.com/v1/studio/render'

/** StitchedUp template - 6 pages = visual styles 1-6 */
export const ORSHOT_TEST_TEMPLATE_ID = 14154

export type OrshotTestPlatform = 'instagram' | 'facebook' | 'google'

export const ORSHOT_PLATFORM_SIZES: Record<OrshotTestPlatform, string> = {
  instagram: '1080x1080',
  facebook:  '1200x630',
  google:    '1080x1350',
}

export interface OrshotRenderRequest {
  style:        number
  platform:       OrshotTestPlatform
  templateId?:    number | string
  /** null = single-page template - omit includePages from Orshot request */
  orshotPage?:    number | null
  fields?:        TemplateField[]
  fieldValues:    Record<string, string>
  logoUrl?:       string
  textStyles?:    SocialTextStyles
}

export interface OrshotRenderSuccess {
  imageUrl:     string
  responseTime?: number
  raw?:         unknown
}

export { orshotParamKey } from '@/lib/social/templateFields'

export function buildOrshotModifications(
  input: OrshotRenderRequest,
  page: number,
): Record<string, string> {
  const fields = input.fields ?? parseTemplateFields(null)
  return buildOrshotFieldModifications(page, fields, input.fieldValues, {
    textStyles: input.textStyles,
    logoUrl:    input.logoUrl,
  })
}

export function extractOrshotImageUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const data = (payload as { data?: unknown }).data

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const content = (data as { content?: unknown }).content
    if (typeof content === 'string' && content.length > 0) return content
  }

  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (first && typeof first === 'object') {
      const content = (first as { content?: unknown }).content
      if (typeof content === 'string' && content.length > 0) return content
    }
  }

  return null
}

export async function renderOrshotStudioTemplate(
  apiKey: string,
  input: OrshotRenderRequest,
): Promise<OrshotRenderSuccess> {
  const templateId = input.templateId ?? ORSHOT_TEST_TEMPLATE_ID
  const pageForMods = input.orshotPage != null
    ? Math.min(6, Math.max(1, Math.round(input.orshotPage)))
    : Math.min(6, Math.max(1, Math.round(input.style)))
  const modifications = buildOrshotModifications({ ...input, style: pageForMods }, pageForMods)

  const response: {
    type:          string
    format:        string
    size:          string
    includePages?: number[]
  } = {
    type:   'url',
    format: 'png',
    size:   ORSHOT_PLATFORM_SIZES[input.platform],
  }

  if (input.orshotPage != null) {
    response.includePages = [pageForMods]
  }

  const body = {
    templateId,
    modifications,
    response,
  }

  console.log('[Orshot] Rendering', {
    templateId,
    page: pageForMods,
    includePages: response.includePages ?? 'omitted',
    modificationKeys: Object.keys(modifications),
  })
  console.log('[Orshot] Full payload', JSON.stringify({ templateId, modifications, response: body.response }))

  const res = await fetch(ORSHOT_RENDER_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const rawText = await res.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error(`Orshot returned non-JSON (${res.status}): ${rawText.slice(0, 200)}`)
  }

  if (!res.ok) {
    const msg =
      (parsed as { message?: string })?.message ??
      (parsed as { error?: string })?.error ??
      rawText.slice(0, 300)
    throw new Error(`Orshot render failed (${res.status}): ${msg}`)
  }

  const imageUrl = extractOrshotImageUrl(parsed)
  if (!imageUrl) {
    throw new Error('Orshot response missing image URL in data.content')
  }

  const responseTime = (parsed as { data?: { responseTime?: number } })?.data &&
    !Array.isArray((parsed as { data?: unknown }).data)
    ? (parsed as { data: { responseTime?: number } }).data.responseTime
    : undefined

  return { imageUrl, responseTime, raw: parsed }
}
