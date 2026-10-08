import {
  isContentFormat,
  isInfographicPreset,
  isPhotoSource,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'

/** Paraphrased creative read from the reference - never verbatim source copy. */
export type InspirationThemeRead = {
  themeSummary: string
  tone: string
  subjectCategory: string
}

/** Structural + creative hints from inspiration analysis - passed to generation, not stored. */
export type InspirationGenerationHints = {
  contentBlockCount: number
  headlineMaxChars: number
  visualStyle: 'photo_led' | 'graphic_led' | 'mixed'
  layoutOrientation: string
  theme: InspirationThemeRead
}

/** Successful vision classification mapped to our compose axes. */
export type InspirationComposePrefill = {
  format: ContentFormat
  infographicPreset: InfographicPreset
  photoSource: PhotoSource
  hints: InspirationGenerationHints
  /** Human-readable label, e.g. "Infographic-style · Checklist" */
  matchedLabel: string
}

function isVisualStyle(value: unknown): value is InspirationGenerationHints['visualStyle'] {
  return (
    value === 'photo_led' || value === 'graphic_led' || value === 'mixed'
  )
}

/** Runtime-parse the Recreate analyze payload before generation. Returns null if malformed. */
export function parseInspirationComposePrefill(
  raw: unknown,
): InspirationComposePrefill | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.format !== 'string' || !isContentFormat(p.format)) return null
  if (typeof p.photoSource !== 'string' || !isPhotoSource(p.photoSource)) return null
  if (typeof p.infographicPreset !== 'string' || !isInfographicPreset(p.infographicPreset)) {
    return null
  }
  if (typeof p.matchedLabel !== 'string' || !p.matchedLabel.trim()) return null
  if (!p.hints || typeof p.hints !== 'object') return null
  const hints = p.hints as Record<string, unknown>
  if (!hints.theme || typeof hints.theme !== 'object') return null
  const theme = hints.theme as Record<string, unknown>
  if (typeof theme.themeSummary !== 'string' || !theme.themeSummary.trim()) return null
  if (typeof theme.tone !== 'string') return null
  if (typeof theme.subjectCategory !== 'string') return null
  if (!isVisualStyle(hints.visualStyle)) return null
  if (typeof hints.layoutOrientation !== 'string') return null
  const contentBlockCount = Number(hints.contentBlockCount)
  const headlineMaxChars = Number(hints.headlineMaxChars)
  if (!Number.isFinite(contentBlockCount) || !Number.isFinite(headlineMaxChars)) return null

  return {
    format: p.format,
    infographicPreset: p.infographicPreset,
    photoSource: p.photoSource,
    matchedLabel: p.matchedLabel,
    hints: {
      contentBlockCount,
      headlineMaxChars,
      visualStyle: hints.visualStyle,
      layoutOrientation: hints.layoutOrientation,
      theme: {
        themeSummary: theme.themeSummary,
        tone: theme.tone,
        subjectCategory: theme.subjectCategory,
      },
    },
  }
}

export const INSPIRATION_NO_MATCH_MESSAGE =
  "Couldn't match this to a format - try Start from scratch instead"

export const INSPIRATION_VIDEO_THUMBNAIL_MESSAGE =
  "This looks like a video post - we can't recreate from a video thumbnail. Try a screenshot of a static post, or use Start from scratch."

/** Preview variant returned before the user selects one (no render credit charged). */
export type InspirationVariantPreview = {
  id: string
  label: string
  imageUrl: string
  format: ContentFormat
  infographicPreset?: InfographicPreset
  photoSource: PhotoSource
  content: unknown
  /** Photo underlay without overlay - overlay retunes reuse this URL. */
  backgroundUrl?: string | null
  /** reference_recreation = gpt-image-2 edit (no scene template). */
  visualPath?: 'reference_recreation' | 'legacy_template'
  recreateMode?: 'closest' | 'fresh_take'
  messageAngle?: 'bold_direct' | 'helpful_educational' | 'trust_proof'
  campaignFocus?: string | null
  imageModel?: string | null
  estimatedUsd?: number | null
  latencyMs?: number | null
  /** Clean GPT-Image-2 output before logo composite - used to switch logos without a new generation. */
  baseStoragePath?: string | null
  logoAssetId?: string | null
  logoVariantType?: string | null
  logoDisabled?: boolean
  logoPosition?: 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_right'
  logoSize?: 'small' | 'medium' | 'large'
  aiBackground?: {
    purpose: string
    sceneId: string
    style: string
    extraDetail?: string
    avoidPeople?: boolean
  }
}
