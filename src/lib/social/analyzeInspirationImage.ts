/**
 * Vision classification of an inspiration image - layout + paraphrased theme read.
 * Does NOT transcribe or reproduce source text (IP safety).
 */

import { z } from 'zod'
import {
  CONTENT_FORMATS,
  INFOGRAPHIC_PRESETS,
  isContentFormat,
  isInfographicPreset,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import type {
  InspirationComposePrefill,
  InspirationGenerationHints,
  InspirationThemeRead,
} from '@/lib/social/inspirationTypes'
import {
  INSPIRATION_NO_MATCH_MESSAGE,
  INSPIRATION_VIDEO_THUMBNAIL_MESSAGE,
} from '@/lib/social/inspirationTypes'

export const INSPIRATION_VISION_MODEL = 'gpt-4o-mini'
const MIN_CONFIDENCE = 0.68

const themeReadSchema = z.object({
  themeSummary: z.string().min(8).max(280),
  tone: z.string().min(2).max(80),
  subjectCategory: z.string().min(2).max(120),
})

const visionSchema = z.object({
  confidence: z.number().min(0).max(1),
  format: z.enum([...CONTENT_FORMATS, 'none']),
  infographicPreset: z.enum(INFOGRAPHIC_PRESETS).nullable().optional(),
  contentBlockCount: z.coerce.number().int().min(0).max(12).default(3),
  headlineMaxChars: z.coerce.number().int().min(0).max(80).default(50),
  visualStyle: z
    .enum(['photo_led', 'graphic_led', 'mixed', 'none'])
    .optional()
    .transform((v) => {
      if (v === 'photo_led' || v === 'graphic_led' || v === 'mixed') return v
      return 'graphic_led' as const
    }),
  layoutOrientation: z.string().min(1).max(120),
  isVideoThumbnailOnly: z.boolean().optional().default(false),
  themeRead: themeReadSchema.optional(),
})

export type InspirationVisionInput = {
  imageBase64: string
  mimeType: string
}

export type PhotoLayoutHeuristic = 'photo_led' | 'graphic_led' | 'mixed' | null

/** Programmatic top/bottom photo detection - complements vision for photo-led/mixed routing. */
export async function detectPhotoLayoutHeuristic(
  input: InspirationVisionInput,
): Promise<PhotoLayoutHeuristic> {
  try {
    const buffer = Buffer.from(input.imageBase64, 'base64')
    const { default: sharp } = await import('sharp')
    const meta = await sharp(buffer).metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    if (width < 50 || height < 50) return null

    const topH = Math.max(1, Math.floor(height * 0.45))
    const bottomH = Math.max(1, height - topH)

    const sampleStats = async (top: number, h: number) => {
      const stats = await sharp(buffer)
        .extract({ left: 0, top, width, height: h })
        .stats()
      const channels = stats.channels.slice(0, 3)
      const avgStd =
        channels.reduce((sum: number, c) => sum + (c.stdev ?? 0), 0) /
        Math.max(channels.length, 1)
      const avgMean =
        channels.reduce((sum: number, c) => sum + (c.mean ?? 0), 0) /
        Math.max(channels.length, 1)
      return { avgStd, avgMean }
    }

    const top = await sampleStats(0, topH)
    const bottom = await sampleStats(topH, bottomH)
    const full = await sampleStats(0, height)

    const PHOTO_STD = 22
    const FLAT_STD = 14
    const MEAN_DELTA = 18

    const meanDelta = Math.abs(top.avgMean - bottom.avgMean)
    const topPhoto = top.avgStd >= PHOTO_STD || meanDelta >= MEAN_DELTA
    const bottomFlat = bottom.avgStd <= FLAT_STD || bottom.avgStd < top.avgStd * 0.7
    const fullPhoto = full.avgStd >= PHOTO_STD

    if (topPhoto && bottomFlat && meanDelta >= MEAN_DELTA * 0.6) return 'mixed'
    if (fullPhoto && top.avgStd >= bottom.avgStd * 0.8) return 'photo_led'
    if (full.avgStd <= FLAT_STD && meanDelta < MEAN_DELTA * 0.5) return 'graphic_led'
    return null
  } catch {
    return null
  }
}

export type InspirationAnalysisResult =
  | { ok: true; prefill: InspirationComposePrefill }
  | { ok: false; message: string }

function photoSourceForVisualStyle(
  visualStyle: InspirationGenerationHints['visualStyle'],
): PhotoSource {
  if (visualStyle === 'photo_led' || visualStyle === 'mixed') {
    return 'ai_generate'
  }
  return 'none'
}

function defaultInfographicPreset(format: ContentFormat): InfographicPreset {
  return format === 'infographic' ? 'checklist' : 'checklist'
}

function buildMatchedLabel(format: ContentFormat, preset?: InfographicPreset | null): string {
  if (format === 'scene') return 'Scene-style'
  if (format === 'quote_card') return 'Quote card'
  const presetLabels: Record<InfographicPreset, string> = {
    checklist: 'Checklist',
    did_you_know: 'Did You Know',
    before_after_comparison: 'Text comparison',
    process_steps: 'Process Steps',
  }
  return preset ? `Infographic-style · ${presetLabels[preset]}` : 'Infographic-style'
}

function normalizeThemeRead(
  raw: z.infer<typeof themeReadSchema> | undefined,
  format: ContentFormat,
): InspirationThemeRead {
  if (raw) {
    return {
      themeSummary: raw.themeSummary.trim(),
      tone: raw.tone.trim(),
      subjectCategory: raw.subjectCategory.trim(),
    }
  }
  const fallbackSubject =
    format === 'scene'
      ? 'trade work showcase'
      : format === 'quote_card'
        ? 'customer testimonial'
        : 'trade tips and advice'
  return {
    themeSummary: `Professional ${fallbackSubject} social post for a trade business`,
    tone: 'professional and trustworthy',
    subjectCategory: fallbackSubject,
  }
}

function mapVisionToPrefill(
  parsed: z.infer<typeof visionSchema>,
  layoutHeuristic: PhotoLayoutHeuristic,
): InspirationAnalysisResult {
  let working = { ...parsed }

  if (working.format === 'none' && layoutHeuristic === 'photo_led') {
    working = {
      ...working,
      format: 'scene',
      confidence: Math.max(working.confidence, 0.72),
    }
  }

  if (
    working.format === 'none' &&
    layoutHeuristic === 'mixed' &&
    working.contentBlockCount >= 2
  ) {
    working = {
      ...working,
      format: 'infographic',
      infographicPreset: working.infographicPreset ?? 'checklist',
      confidence: Math.max(working.confidence, 0.72),
    }
  }

  if (working.isVideoThumbnailOnly) {
    return { ok: false, message: INSPIRATION_VIDEO_THUMBNAIL_MESSAGE }
  }

  if (working.format === 'none' || working.confidence < MIN_CONFIDENCE) {
    return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
  }

  if (!isContentFormat(working.format)) {
    return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
  }

  const format = working.format as ContentFormat
  let infographicPreset = defaultInfographicPreset(format)

  if (format === 'infographic') {
    const presetRaw = working.infographicPreset
    if (!presetRaw || !isInfographicPreset(presetRaw)) {
      return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
    }
    infographicPreset = presetRaw
  }

  const layoutLower = working.layoutOrientation.trim().toLowerCase()
  let visualStyle = working.visualStyle
  let photoSource = photoSourceForVisualStyle(visualStyle)

  if (layoutHeuristic === 'photo_led' || layoutHeuristic === 'mixed') {
    visualStyle = layoutHeuristic
    photoSource = 'ai_generate'
  }

  // Scene format is inherently photo-led in our product - always use AI photo background.
  if (format === 'scene') {
    visualStyle = 'photo_led'
    photoSource = 'ai_generate'
  } else if (
    format === 'infographic' &&
    (visualStyle === 'mixed' ||
      layoutHeuristic === 'mixed' ||
      /photo|split|top.?half|image.?top|hero|upper.?photo|photo.?top/.test(layoutLower))
  ) {
    visualStyle = 'mixed'
    photoSource = 'ai_generate'
  }

  const hints: InspirationGenerationHints = {
    contentBlockCount: Math.max(1, parsed.contentBlockCount),
    headlineMaxChars: Math.min(80, Math.max(12, working.headlineMaxChars || 50)),
    visualStyle,
    layoutOrientation: working.layoutOrientation.trim(),
    theme: normalizeThemeRead(working.themeRead, format),
  }

  const prefill: InspirationComposePrefill = {
    format,
    infographicPreset,
    photoSource,
    hints,
    matchedLabel: buildMatchedLabel(format, format === 'infographic' ? infographicPreset : null),
  }

  return { ok: true, prefill }
}

function buildSystemPrompt(): string {
  return [
    'You classify social media post LAYOUTS for StitchedUp - software for Australian tradies.',
    'Analyze structure AND paraphrase the post theme in your own words.',
    'NEVER transcribe, quote, or reproduce any visible text from the image.',
    'themeRead fields must be original paraphrases - not copied captions or headlines.',
    'Return ONLY valid JSON matching the requested schema.',
  ].join(' ')
}

function buildUserPrompt(): string {
  return `Classify this social post image into ONE of StitchedUp's render formats (or "none" if no good match).

Our formats:
1. scene - photo-led hero: large photo with headline/tagline/CTA overlay (text-over-image or bottom bar).
2. infographic - graphic/template-led with structured blocks. Presets:
   - checklist: numbered or bulleted list of tips (3-7 items)
   - did_you_know: single fact/stat callout with headline + body
   - before_after_comparison: two-column text comparison (before vs after panels, NOT photo before/after)
   - process_steps: numbered 1-2-3 sequence
3. quote_card - customer review/testimonial with quote text and optional stars

Fields to return:
- confidence: 0-1 how well it matches ONE of our formats (use <0.68 if unsure)
- format: "scene" | "infographic" | "quote_card" | "none"
- infographicPreset: required when format is infographic, else null
- contentBlockCount: distinct text/content blocks (list items, steps, panels, etc.)
- headlineMaxChars: approximate max characters for the main headline/title (not the text itself)
- visualStyle: "photo_led" if a real photo dominates; "graphic_led" if mostly designed graphics/text; "mixed" if both photo and designed text blocks are important
- layoutOrientation: short label e.g. "text-over-image", "split left/right", "stacked list", "centered quote"
- isVideoThumbnailOnly: true ONLY when the image is clearly a video/reel thumbnail (play button, reel UI, duration badge, etc.) with no usable static post layout - NOT for normal photo posts
- themeRead: {
    themeSummary: one sentence paraphrasing what the post is about (e.g. "before/after renovation reveal celebrating completed exterior work"),
    tone: short label for mood (e.g. "upbeat and celebratory", "educational and calm"),
    subjectCategory: short subject label (e.g. "residential exterior renovation", "plumbing maintenance tips")
  }

If the post is a carousel, meme, unrelated ad, or nothing like our templates, set format to "none".
If isVideoThumbnailOnly is true, set format to "none" as well.`
}

export async function analyzeInspirationImage(
  input: InspirationVisionInput,
): Promise<InspirationAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const dataUrl = `data:${input.mimeType};base64,${input.imageBase64}`

  const response = await client.chat.completions.create({
    model: INSPIRATION_VISION_MODEL,
    max_tokens: 550,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildUserPrompt() },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
        ],
      },
    ],
  })

  const raw = response.choices[0]?.message?.content?.trim() ?? ''
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error('[Inspiration] Invalid JSON from vision model:', raw.slice(0, 200))
    return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
  }

  const validated = visionSchema.safeParse(parsed)
  if (!validated.success) {
    console.warn('[Inspiration] Schema validation failed', validated.error.flatten())
    return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
  }

  const layoutHeuristic = await detectPhotoLayoutHeuristic(input)
  return mapVisionToPrefill(validated.data, layoutHeuristic)
}

/** @internal Test helper - maps parsed vision JSON without calling OpenAI. */
export function mapInspirationVisionForTest(
  raw: unknown,
  layoutHeuristic: PhotoLayoutHeuristic = null,
): InspirationAnalysisResult {
  const validated = visionSchema.safeParse(raw)
  if (!validated.success) {
    return { ok: false, message: INSPIRATION_NO_MATCH_MESSAGE }
  }
  return mapVisionToPrefill(validated.data, layoutHeuristic)
}
