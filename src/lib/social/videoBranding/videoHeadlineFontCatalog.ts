import type { SocialFontFamily } from '@/lib/social/socialTextStyle'
import { BUNDLED_SOCIAL_FONTS } from '@/lib/social/bundledSocialFontManifest'
import type { VideoHeadlineFontId, VideoHeadlineWeight } from '@/lib/social/videoBranding/types'

export type VideoHeadlineFontEntry = {
  id: VideoHeadlineFontId
  /** Customer-facing label - matches Social Create Images font names. */
  label: SocialFontFamily
  regularFile: string
  boldFile: string
  /** Display faces read as bold at Regular weight. */
  displayFace: boolean
}

/**
 * Worker-trusted video headline fonts (subset of Social's 24).
 * Bold uses bundled Regular for display faces; worker-bold/ for sans with apt copies.
 */
export const VIDEO_HEADLINE_FONTS: readonly VideoHeadlineFontEntry[] = [
  {
    id: 'inter',
    label: 'Inter',
    regularFile: 'Inter-Regular.ttf',
    boldFile: 'worker-bold/Inter-Bold.otf',
    displayFace: false,
  },
  {
    id: 'roboto',
    label: 'Roboto',
    regularFile: 'Roboto-Regular.ttf',
    boldFile: 'worker-bold/Roboto-Bold.ttf',
    displayFace: false,
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    regularFile: 'OpenSans-Regular.ttf',
    boldFile: 'worker-bold/OpenSans-Bold.ttf',
    displayFace: false,
  },
  {
    id: 'oswald',
    label: 'Oswald',
    regularFile: 'Oswald-Regular.ttf',
    boldFile: 'Oswald-Regular.ttf',
    displayFace: true,
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    regularFile: 'BebasNeue-Regular.ttf',
    boldFile: 'worker-bold/BebasNeue-Bold.otf',
    displayFace: true,
  },
  {
    id: 'anton',
    label: 'Anton',
    regularFile: 'Anton-Regular.ttf',
    boldFile: 'Anton-Regular.ttf',
    displayFace: true,
  },
  {
    id: 'fjalla-one',
    label: 'Fjalla One',
    regularFile: 'FjallaOne-Regular.ttf',
    boldFile: 'FjallaOne-Regular.ttf',
    displayFace: true,
  },
] as const

const FONT_BY_ID = new Map(VIDEO_HEADLINE_FONTS.map((f) => [f.id, f]))

const SOCIAL_LABEL_TO_FONT_ID = new Map(
  VIDEO_HEADLINE_FONTS.map((f) => [f.label, f.id]),
)

/** Social image fonts not yet exposed for video (no worker bold file). */
export const VIDEO_HEADLINE_EXCLUDED_SOCIAL_FONTS: readonly SocialFontFamily[] =
  BUNDLED_SOCIAL_FONTS.map((f) => f.family).filter(
    (family) => !SOCIAL_LABEL_TO_FONT_ID.has(family),
  ) as SocialFontFamily[]

export function isVideoHeadlineFontId(value: string): value is VideoHeadlineFontId {
  return FONT_BY_ID.has(value as VideoHeadlineFontId)
}

export function videoHeadlineFontFromSocialFamily(
  family: string | null | undefined,
): VideoHeadlineFontId {
  const trimmed = family?.trim()
  if (trimmed && SOCIAL_LABEL_TO_FONT_ID.has(trimmed as SocialFontFamily)) {
    return SOCIAL_LABEL_TO_FONT_ID.get(trimmed as SocialFontFamily)!
  }
  return 'inter'
}

export function videoHeadlineFontLabel(fontId: VideoHeadlineFontId): string {
  return FONT_BY_ID.get(fontId)?.label ?? 'Inter'
}

export function videoHeadlineFontEntry(fontId: VideoHeadlineFontId): VideoHeadlineFontEntry {
  const entry = FONT_BY_ID.get(fontId)
  if (!entry) throw new Error('invalid_font')
  return entry
}

export function videoHeadlineFontFile(
  fontId: VideoHeadlineFontId,
  weight: VideoHeadlineWeight,
): string {
  const entry = videoHeadlineFontEntry(fontId)
  return weight === 'bold' ? entry.boldFile : entry.regularFile
}
