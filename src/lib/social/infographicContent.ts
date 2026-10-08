/**
 * Phase C - AI infographic copy (gpt-4o-mini → Zod).
 * Does not render images; Phase D composites SVG via resvg.
 */

import OpenAI from 'openai'
import { z } from 'zod'
import {
  CHECKLIST_BULLET_MAX_CHARS,
  checklistMaxItemsForPlatform,
  isInfographicPreset,
  type ComposePlatform,
  type InfographicPreset,
} from '@/lib/social/composeModel'
import { buildServicesSnippet } from '@/lib/social/aiImagePrompt'
import {
  formatCanonicalTradeLabel,
  inferCanonicalTrade,
} from '@/lib/social/canonicalTrades'
import { DEFAULT_BUSINESS_KIND } from '@/lib/social/inferTradeCategory'
import {
  DEFAULT_POST_SUBTYPE_ID,
  getPostSubtypeDefinition,
  postOccasionLabel,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import {
  INFOGRAPHIC_ICON_KEYS,
} from '@/lib/social/infographic/infographicIcons'
import {
  INFOGRAPHIC_VISUAL_THEME_IDS,
  type InfographicVisualThemeId,
} from '@/lib/social/infographic/infographicVisualTheme'

export type { InfographicVisualThemeId }

export const INFOGRAPHIC_CONTENT_MODEL = 'gpt-4o-mini'

const visualThemeSchema = z
  .enum(INFOGRAPHIC_VISUAL_THEME_IDS)
  .optional()
  .nullable()

const itemIconsSchema = z
  .array(z.enum(INFOGRAPHIC_ICON_KEYS))
  .max(7)
  .optional()
  .nullable()

// ── Zod schemas (per preset) ──────────────────────────────────────────────────

export const checklistContentSchema = z.object({
  title: z.string().min(1).max(80),
  items: z.array(z.string().min(1).max(CHECKLIST_BULLET_MAX_CHARS + 20)).min(3).max(7),
  footerCta: z.string().max(80).optional().nullable(),
  visualTheme: visualThemeSchema,
  itemIcons: itemIconsSchema,
})

export const didYouKnowContentSchema = z.object({
  headline: z.string().min(1).max(60),
  fact: z.string().min(1).max(220),
  stat: z.string().max(24).optional().nullable(),
  visualTheme: visualThemeSchema,
})

export const beforeAfterComparisonContentSchema = z.object({
  title: z.string().min(1).max(80),
  beforeTitle: z.string().min(1).max(40),
  beforePoints: z.array(z.string().min(1).max(90)).min(2).max(4),
  afterTitle: z.string().min(1).max(40),
  afterPoints: z.array(z.string().min(1).max(90)).min(2).max(4),
  visualTheme: visualThemeSchema,
})

export const processStepsContentSchema = z.object({
  title: z.string().min(1).max(80),
  steps: z
    .array(
      z.object({
        label: z.string().min(1).max(48),
        detail: z.string().min(1).max(120),
      }),
    )
    .min(2)
    .max(4),
  visualTheme: visualThemeSchema,
})

export type ChecklistContent = z.infer<typeof checklistContentSchema>
export type DidYouKnowContent = z.infer<typeof didYouKnowContentSchema>
export type BeforeAfterComparisonContent = z.infer<typeof beforeAfterComparisonContentSchema>
export type ProcessStepsContent = z.infer<typeof processStepsContentSchema>

export type InfographicContentByPreset = {
  checklist: ChecklistContent
  did_you_know: DidYouKnowContent
  before_after_comparison: BeforeAfterComparisonContent
  process_steps: ProcessStepsContent
}

export type InfographicContent = InfographicContentByPreset[InfographicPreset]

const SCHEMA_BY_PRESET = {
  checklist: checklistContentSchema,
  did_you_know: didYouKnowContentSchema,
  before_after_comparison: beforeAfterComparisonContentSchema,
  process_steps: processStepsContentSchema,
} as const

export interface InfographicContentRequest {
  preset: InfographicPreset
  platform: ComposePlatform
  postSubtype?: PostSubtypeId
  business: {
    name?: string | null
    ai_agent_services?: string | null
    social_default_cta?: string | null
  }
  job?: {
    title?: string | null
    description?: string | null
    site_suburb?: string | null
    site_state?: string | null
  } | null
  /** Optional hints from inspiration analysis (layout + paraphrased theme). */
  generationHints?: InspirationGenerationHints | null
  /** When generating recreate variants - distinct creative angle per index. */
  variantIndex?: number
  variantCount?: number
}

export interface InfographicContentResult {
  preset: InfographicPreset
  platform: ComposePlatform
  tradeId: string | null
  tradeLabel: string
  servicesSnippet: string | null
  content: InfographicContent
  model: string
  retried: boolean
}

function clampChecklistContent(
  raw: ChecklistContent,
  platform: ComposePlatform,
): ChecklistContent {
  const maxItems = checklistMaxItemsForPlatform(platform)
  const items = raw.items
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((s) =>
      s.length > CHECKLIST_BULLET_MAX_CHARS
        ? `${s.slice(0, CHECKLIST_BULLET_MAX_CHARS - 1)}…`
        : s,
    )

  while (items.length < 3 && raw.items[items.length]) {
    const fallback = raw.items[items.length].replace(/\s+/g, ' ').trim()
    if (fallback) items.push(fallback.slice(0, CHECKLIST_BULLET_MAX_CHARS))
  }

  return checklistContentSchema.parse({
    title: raw.title.trim().slice(0, 80),
    items,
    footerCta: raw.footerCta?.trim() || null,
    visualTheme: raw.visualTheme ?? null,
    itemIcons: raw.itemIcons?.slice(0, items.length) ?? null,
  })
}

function postProcess(
  preset: InfographicPreset,
  platform: ComposePlatform,
  parsed: InfographicContent,
): InfographicContent {
  if (preset === 'checklist') {
    return clampChecklistContent(parsed as ChecklistContent, platform)
  }
  return parsed
}

function jsonSchemaHint(preset: InfographicPreset, platform: ComposePlatform): string {
  const maxItems = checklistMaxItemsForPlatform(platform)
  switch (preset) {
    case 'checklist':
      return `JSON shape: {"title": string, "items": string[${3}-${maxItems}], "footerCta"?: string|null, "visualTheme"?: ${INFOGRAPHIC_VISUAL_THEME_IDS.map((v) => `"${v}"`).join('|')}|null, "itemIcons"?: string[]|null}
Rules: exactly ${3}-${maxItems} items; each item ≤ ${CHECKLIST_BULLET_MAX_CHARS} characters; Australian spelling; practical tips about these products (storing, using, choosing, ordering).
Optional visualTheme - pick one that matches the post occasion (e.g. seasonal_winter for winter posts, educational for tips).
Optional itemIcons - same length as items; each key one of: ${INFOGRAPHIC_ICON_KEYS.join(', ')}. Pick icons that match each bullet; omit itemIcons if none fit.`
    case 'did_you_know':
      return `JSON shape: {"headline": string, "fact": string, "stat"?: string|null, "visualTheme"?: ${INFOGRAPHIC_VISUAL_THEME_IDS.map((v) => `"${v}"`).join('|')}|null}
Rules: one surprising but accurate food, produce or growing fact; optional short stat like "87%" or "2×"; no fake precision.
Optional visualTheme when the occasion is seasonal or promotional.`
    case 'before_after_comparison':
      return `JSON shape: {"title": string, "beforeTitle": string, "beforePoints": string[2-4], "afterTitle": string, "afterPoints": string[2-4], "visualTheme"?: ${INFOGRAPHIC_VISUAL_THEME_IDS.map((v) => `"${v}"`).join('|')}|null}
Rules: TEXT comparison only (myth vs truth, old habit vs better practice) - NOT a photo before/after. Short punchy points.
Optional visualTheme when the occasion is seasonal or promotional.`
    case 'process_steps':
      return `JSON shape: {"title": string, "steps": [{"label": string, "detail": string}] with 3 items preferred (2-4 ok), "visualTheme"?: ${INFOGRAPHIC_VISUAL_THEME_IDS.map((v) => `"${v}"`).join('|')}|null}
Rules: clear customer-facing journey for ordering, pre-ordering, subscribing or collecting.
Optional visualTheme when the occasion is seasonal or promotional.`
  }
}

function buildSystemPrompt(): string {
  return [
    'You write short, high-converting social infographic copy for small Australian food and produce sellers.',
    'Return ONLY valid JSON matching the requested shape - no markdown fences, no commentary.',
    'Tone: clear, warm, local stallholder - not agency fluff.',
    'Do not use: at your doorstep, save big, unlock, hassle-free, just a call away, trusted experts are here.',
    'Never invent competitor names, certifications, prices, or health/nutrition claims you cannot justify.',
    'Do not include hashtags or emoji unless they are part of a short title.',
  ].join(' ')
}

function buildUserPrompt(req: InfographicContentRequest): string {
  const tradeId = inferCanonicalTrade({
    ai_agent_services: req.business.ai_agent_services,
    name: req.business.name,
  })
  const tradeLabel = tradeId
    ? formatCanonicalTradeLabel(tradeId)
    : DEFAULT_BUSINESS_KIND
  const services = buildServicesSnippet(req.business, 160)
  const businessName = req.business.name?.trim() || 'the business'
  const postSubtype = req.postSubtype ?? DEFAULT_POST_SUBTYPE_ID
  const occasion = getPostSubtypeDefinition(postSubtype)

  const jobBits: string[] = []
  if (req.job?.title?.trim()) jobBits.push(`Product or offer: ${req.job.title.trim()}`)
  if (req.job?.description?.trim()) {
    jobBits.push(`Details: ${req.job.description.trim().slice(0, 200)}`)
  }
  if (req.job?.site_suburb?.trim()) {
    const loc = [req.job.site_suburb, req.job.site_state].filter(Boolean).join(', ')
    jobBits.push(`Location: ${loc}`)
  }

  const hintLines: string[] = []
  const hints = req.generationHints
  if (hints) {
    hintLines.push(
      'Inspiration read (paraphrased - write original copy, do not copy any source post):',
      `- Theme: ${hints.theme.themeSummary}`,
      `- Tone: ${hints.theme.tone}`,
      `- Subject: ${hints.theme.subjectCategory}`,
      `- Target main title/headline length: about ${hints.headlineMaxChars} characters`,
      `- Target distinct content blocks: ${hints.contentBlockCount}`,
      `- Layout orientation: ${hints.layoutOrientation}`,
      `- Visual style: ${
        hints.visualStyle === 'photo_led'
          ? 'photo-led'
          : hints.visualStyle === 'mixed'
            ? 'mixed photo + graphic'
            : 'graphic-led'
      }`,
    )
    if (req.preset === 'checklist' || req.preset === 'process_steps') {
      hintLines.push(
        `- Aim for ${Math.min(Math.max(hints.contentBlockCount, 3), req.preset === 'process_steps' ? 4 : 7)} ${
          req.preset === 'process_steps' ? 'steps' : 'list items'
        }`,
      )
    }
  }

  const variantIndex = req.variantIndex
  const variantCount = req.variantCount ?? 3
  const variantLines: string[] = []
  if (variantIndex != null && variantCount > 1) {
    const angles = [
      'Direct and bold - lead with the main benefit or outcome.',
      'Educational angle - teach or explain with a helpful framing.',
      'Social proof or trust angle - emphasise reliability and results.',
    ]
    variantLines.push(
      '',
      `Creative variant ${variantIndex + 1} of ${variantCount}: ${angles[variantIndex % angles.length]}`,
      'Make this variant clearly different from the other variants while staying on-theme.',
    )
  }

  return [
    `Preset: ${presetLabel(req.preset)}`,
    `Platform: ${req.platform}`,
    `Post occasion (non-binding): ${postOccasionLabel(occasion.categoryId, postSubtype)}`,
    `Content angle: ${occasion.infographicHint}`,
    `Business: ${businessName}`,
    `Business type: ${tradeLabel}${tradeId ? ` (${tradeId})` : ''}`,
    services ? `What they sell: ${services}` : 'What they sell: (not provided - keep tips general to local food and produce)',
    jobBits.length ? jobBits.join('\n') : 'Product / offer context: none',
    hintLines.length ? ['', ...hintLines].join('\n') : '',
    variantLines.length ? variantLines.join('\n') : '',
    '',
    jsonSchemaHint(req.preset, req.platform),
  ].join('\n')
}

function presetLabel(preset: InfographicPreset): string {
  return preset.replace(/_/g, ' ')
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object')
  }
  return JSON.parse(candidate.slice(start, end + 1))
}

async function callModel(
  system: string,
  user: string,
  nudge?: string,
  variantIndex?: number,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const client = new OpenAI({ apiKey })
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
  if (nudge) {
    messages.push({
      role: 'user',
      content: nudge,
    })
  }

  const temperature =
    variantIndex != null ? 0.85 + (variantIndex % 3) * 0.05 : 0.7

  const response = await client.chat.completions.create({
    model: INFOGRAPHIC_CONTENT_MODEL,
    max_tokens: 700,
    temperature,
    response_format: { type: 'json_object' },
    messages,
  })

  const text = response.choices[0]?.message?.content?.trim()
  if (!text) throw new Error('Empty response from OpenAI')
  return text
}

export function parseInfographicContent(
  preset: InfographicPreset,
  platform: ComposePlatform,
  raw: unknown,
): InfographicContent {
  const schema = SCHEMA_BY_PRESET[preset]
  const parsed = schema.parse(raw) as InfographicContent
  return postProcess(preset, platform, parsed)
}

export async function generateInfographicContent(
  req: InfographicContentRequest,
): Promise<InfographicContentResult> {
  if (!isInfographicPreset(req.preset)) {
    throw new Error('Invalid preset')
  }

  const tradeId = inferCanonicalTrade({
    ai_agent_services: req.business.ai_agent_services,
    name: req.business.name,
  })
  const tradeLabel = tradeId ? formatCanonicalTradeLabel(tradeId) : DEFAULT_BUSINESS_KIND
  const servicesSnippet = buildServicesSnippet(req.business, 160)

  const system = buildSystemPrompt()
  const user = buildUserPrompt(req)

  let retried = false
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const nudge =
        attempt === 0
          ? undefined
          : `Previous JSON failed validation. Return shorter, stricter JSON for ${req.preset} on ${req.platform}. Checklist bullets must be ≤ ${CHECKLIST_BULLET_MAX_CHARS} chars${
              req.preset === 'checklist' && req.platform === 'facebook'
                ? ` and at most ${checklistMaxItemsForPlatform('facebook')} items`
                : ''
            }.`
      if (attempt === 1) retried = true

      const text = await callModel(system, user, nudge, req.variantIndex)
      const json = extractJsonObject(text)
      const content = parseInfographicContent(req.preset, req.platform, json)

      return {
        preset: req.preset,
        platform: req.platform,
        tradeId,
        tradeLabel,
        servicesSnippet,
        content,
        model: INFOGRAPHIC_CONTENT_MODEL,
        retried,
      }
    } catch (err) {
      lastError = err
      console.warn('[InfographicContent] attempt failed', {
        attempt,
        preset: req.preset,
        platform: req.platform,
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to generate infographic content')
}
