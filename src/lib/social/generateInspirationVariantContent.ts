/**
 * AI copy for Recreate-from-Inspiration variants (scene + quote card).
 * Infographic variants reuse generateInfographicContent with variantIndex.
 */

import OpenAI from 'openai'
import { z } from 'zod'
import {
  defaultSceneCta,
  sceneContentSchema,
  SCENE_CTA_MAX,
  SCENE_HEADLINE_MAX,
  SCENE_TAGLINE_MAX,
  type SceneContent,
} from '@/lib/social/sceneContent'
import {
  quoteCardContentSchema,
  QUOTE_CTA_LINE_MAX,
  QUOTE_CUSTOMER_NAME_MAX,
  QUOTE_INTRO_LINE_MAX,
  QUOTE_TEXT_MAX,
  type QuoteCardContent,
} from '@/lib/social/quoteCardContent'
import { buildServicesSnippet } from '@/lib/social/aiImagePrompt'
import {
  formatCanonicalTradeLabel,
  inferCanonicalTrade,
} from '@/lib/social/canonicalTrades'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import { resolveDefaultTagline } from '@/lib/social/templateFields'

export const INSPIRATION_VARIANT_CONTENT_MODEL = 'gpt-4o-mini'

const VARIANT_ANGLES = [
  'Direct and bold - lead with the main benefit or outcome.',
  'Educational angle - teach or explain with a helpful framing.',
  'Social proof or trust angle - emphasise reliability and results.',
] as const

export type InspirationVariantContentRequest = {
  format: 'scene' | 'quote_card'
  business: {
    name?: string | null
    phone?: string | null
    suburb?: string | null
    ai_agent_services?: string | null
    social_default_cta?: string | null
  }
  hints: InspirationGenerationHints
  variantIndex: number
  variantCount?: number
}

function variantAngle(index: number, count: number): string {
  return VARIANT_ANGLES[index % VARIANT_ANGLES.length]
}

function buildThemeBlock(hints: InspirationGenerationHints): string {
  return [
    'Inspiration read (paraphrased - write original copy):',
    `- Theme: ${hints.theme.themeSummary}`,
    `- Tone: ${hints.theme.tone}`,
    `- Subject: ${hints.theme.subjectCategory}`,
    `- Layout: ${hints.layoutOrientation}`,
    `- Headline length target: ~${hints.headlineMaxChars} chars`,
  ].join('\n')
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

async function callModel(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model: INSPIRATION_VARIANT_CONTENT_MODEL,
    max_tokens: 400,
    temperature: 0.85,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const text = response.choices[0]?.message?.content?.trim()
  if (!text) throw new Error('Empty response from OpenAI')
  return text
}

export async function generateInspirationSceneContent(
  req: InspirationVariantContentRequest,
): Promise<SceneContent> {
  const tradeId = inferCanonicalTrade({
    ai_agent_services: req.business.ai_agent_services,
    name: req.business.name,
  })
  const tradeLabel = tradeId ? formatCanonicalTradeLabel(tradeId) : 'Trade'
  const businessName = req.business.name?.trim() || 'Your Business'
  const services = buildServicesSnippet(req.business, 120)
  const count = req.variantCount ?? 3
  const ctaDefault = defaultSceneCta(req.business)

  const suburb = req.business.suburb?.trim()
  const system = [
    'You write short scene-style social post overlay copy for Australian trade businesses.',
    'Return ONLY valid JSON: { "headline": string, "tagline": string, "cta": string }.',
    'Never copy text from the inspiration reference - paraphrase the theme in fresh words.',
    'Sound like a local tradie, not an ad agency.',
    'Do not use: at your doorstep, save big, unlock, hassle-free, just a call away, trusted experts are here, solutions you can count on, book now and save.',
    'Put the business name in the headline or tagline when it fits naturally.',
  ].join(' ')

  const user = [
    `Business: ${businessName}`,
    `Trade: ${tradeLabel}`,
    suburb ? `Suburb: ${suburb}` : '',
    services ? `Services: ${services}` : '',
    buildThemeBlock(req.hints),
    '',
    `Variant ${req.variantIndex + 1} of ${count}: ${variantAngle(req.variantIndex, count)}`,
    'Vary the headline for this angle. Do not invent a new call to action.',
    `Headline max ${SCENE_HEADLINE_MAX} chars, tagline max ${SCENE_TAGLINE_MAX}, cta max ${SCENE_CTA_MAX}.`,
    `Use this exact CTA: "${ctaDefault}"`,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = extractJsonObject(await callModel(system, user))
  const parsed = sceneContentSchema.parse(raw)

  const tagline =
    parsed.tagline.trim() ||
    resolveDefaultTagline(req.business).slice(0, SCENE_TAGLINE_MAX)

  return {
    headline: parsed.headline.trim(),
    tagline,
    cta: ctaDefault,
  }
}

export async function generateInspirationQuoteContent(
  req: InspirationVariantContentRequest,
): Promise<QuoteCardContent> {
  const tradeId = inferCanonicalTrade({
    ai_agent_services: req.business.ai_agent_services,
    name: req.business.name,
  })
  const tradeLabel = tradeId ? formatCanonicalTradeLabel(tradeId) : 'Trade'
  const businessName = req.business.name?.trim() || 'Your Business'
  const count = req.variantCount ?? 3

  const quoteSchema = z.object({
    quoteText: z.string().min(1).max(QUOTE_TEXT_MAX),
    customerName: z.string().min(1).max(QUOTE_CUSTOMER_NAME_MAX),
    starRating: z.number().int().min(4).max(5).optional(),
    introLine: z.string().max(QUOTE_INTRO_LINE_MAX).optional(),
    ctaLine: z.string().max(QUOTE_CTA_LINE_MAX).optional(),
  })

  const system = [
    'You write fictional but realistic customer review copy for Australian trade businesses.',
    'Return ONLY valid JSON matching the schema.',
    'Never copy text from the inspiration reference.',
    'Use plausible generic customer names (first name + initial), not real people.',
    'Do not use: at your doorstep, save big, unlock, hassle-free, just a call away.',
  ].join(' ')

  const user = [
    `Business: ${businessName}`,
    `Trade: ${tradeLabel}`,
    buildThemeBlock(req.hints),
    '',
    `Variant ${req.variantIndex + 1} of ${count}: ${variantAngle(req.variantIndex, count)}`,
    'Include starRating 4 or 5. quoteText and customerName are required.',
  ].join('\n')

  const raw = extractJsonObject(await callModel(system, user))
  return quoteCardContentSchema.parse(raw)
}

export function inspirationAiBackgroundForTheme(
  hints: InspirationGenerationHints,
  variantIndex: number,
): {
  purpose: string
  sceneId: string
  style: string
  extraDetail: string
  avoidPeople: boolean
} {
  const styles = ['photorealistic', 'bold_ad', 'minimal'] as const
  return {
    purpose: 'job_showcase',
    sceneId: 'on_site',
    style: styles[variantIndex % styles.length],
    extraDetail: `${hints.theme.subjectCategory}. ${hints.theme.themeSummary}`.slice(0, 150),
    avoidPeople: true,
  }
}

export const INSPIRATION_VARIANT_LABELS = [
  'Bold & direct',
  'Helpful & educational',
  'Trust & proof',
] as const

export function inspirationVariantLabel(index: number): string {
  return INSPIRATION_VARIANT_LABELS[index % INSPIRATION_VARIANT_LABELS.length]
}
