import {
  RECREATE_NO_LOGO_ID,
  isBrandLogoAssetId,
  type RecreateLogoChoice,
} from '@/lib/brand/businessBrandLogos'
import { parseSocialLogoCorner } from '@/lib/social/socialLogoCorner'
import {
  VIDEO_HEADLINE_ALIGNS,
  VIDEO_HEADLINE_BACKGROUNDS,
  VIDEO_HEADLINE_SIZES,
  VIDEO_HEADLINE_WEIGHTS,
  VIDEO_LOGO_POSITIONS,
  VIDEO_LOGO_SIZES,
  VIDEO_TEXT_POSITIONS,
  type VideoBrandingConfig,
  type VideoHeadlineAlign,
  type VideoHeadlineBackground,
  type VideoHeadlineFontId,
  type VideoHeadlineSize,
  type VideoHeadlineWeight,
  type VideoLogoChoiceKind,
  type VideoLogoPosition,
  type VideoLogoSize,
  type VideoTextPosition,
} from '@/lib/social/videoBranding/types'
import {
  isValidVideoHeadlineColor,
  mergeBrandingConfigWithDefaults,
  newVideoHeadlineStyleDefaults,
  normalizeVideoHeadlineColor,
  type VideoHeadlineBusinessDefaults,
} from '@/lib/social/videoBranding/headlineStyle'
import { isVideoHeadlineFontId } from '@/lib/social/videoBranding/videoHeadlineFontCatalog'

export const VIDEO_OVERLAY_TEXT_MAX_CHARS = 80

const LOGO_POSITION_SET = new Set<string>(VIDEO_LOGO_POSITIONS)
const LOGO_SIZE_SET = new Set<string>(VIDEO_LOGO_SIZES)
const TEXT_POSITION_SET = new Set<string>(VIDEO_TEXT_POSITIONS)
const HEADLINE_SIZE_SET = new Set<string>(VIDEO_HEADLINE_SIZES)
const HEADLINE_WEIGHT_SET = new Set<string>(VIDEO_HEADLINE_WEIGHTS)
const HEADLINE_ALIGN_SET = new Set<string>(VIDEO_HEADLINE_ALIGNS)
const HEADLINE_BACKGROUND_SET = new Set<string>(VIDEO_HEADLINE_BACKGROUNDS)

export function isVideoLogoPosition(value: string): value is VideoLogoPosition {
  return LOGO_POSITION_SET.has(value)
}

export function isVideoLogoSize(value: string): value is VideoLogoSize {
  return LOGO_SIZE_SET.has(value)
}

export function isVideoTextPosition(value: string): value is VideoTextPosition {
  return TEXT_POSITION_SET.has(value)
}

export function socialLogoCornerToVideoPosition(
  corner: string | null | undefined,
): VideoLogoPosition {
  const parsed = parseSocialLogoCorner(corner)
  const map: Record<string, VideoLogoPosition> = {
    'top-left': 'top_left',
    'top-right': 'top_right',
    'bottom-left': 'bottom_left',
    'bottom-right': 'bottom_right',
  }
  return map[parsed] ?? 'top_left'
}

export function parseVideoLogoChoice(input: {
  logoAssetId?: unknown
}): { ok: true; choice: RecreateLogoChoice } | { ok: false; error: string } {
  if (input.logoAssetId === RECREATE_NO_LOGO_ID || input.logoAssetId === null) {
    return { ok: true, choice: { kind: 'none' } }
  }
  if (input.logoAssetId === undefined || input.logoAssetId === '' || input.logoAssetId === 'primary') {
    return { ok: true, choice: { kind: 'primary' } }
  }
  if (typeof input.logoAssetId !== 'string' || !isBrandLogoAssetId(input.logoAssetId)) {
    return { ok: false, error: 'Invalid logo selection' }
  }
  return { ok: true, choice: { kind: 'asset', id: input.logoAssetId.trim() } }
}

export function parseVideoBrandingRequest(input: {
  logoAssetId?: unknown
  logoPosition?: unknown
  logoSize?: unknown
  overlayText?: unknown
  textPosition?: unknown
  overlayTextFont?: unknown
  overlayTextSize?: unknown
  overlayTextColor?: unknown
  overlayTextWeight?: unknown
  overlayTextAlign?: unknown
  overlayTextBackground?: unknown
  defaultLogoCorner?: string | null
  businessDefaults?: VideoHeadlineBusinessDefaults
}):
  | { ok: true; config: VideoBrandingConfig }
  | { ok: false; error: string; status: number } {
  const logoParsed = parseVideoLogoChoice({ logoAssetId: input.logoAssetId })
  if (!logoParsed.ok) {
    return { ok: false, error: logoParsed.error, status: 400 }
  }

  const logoChoice: VideoLogoChoiceKind =
    logoParsed.choice.kind === 'none'
      ? 'none'
      : logoParsed.choice.kind === 'primary'
        ? 'primary'
        : 'asset'

  const logoAssetId =
    logoParsed.choice.kind === 'asset' ? logoParsed.choice.id : null

  let logoPosition: VideoLogoPosition | null = null
  if (logoChoice !== 'none') {
    if (input.logoPosition == null || input.logoPosition === '') {
      logoPosition = socialLogoCornerToVideoPosition(input.defaultLogoCorner)
    } else if (typeof input.logoPosition === 'string' && isVideoLogoPosition(input.logoPosition)) {
      logoPosition = input.logoPosition
    } else {
      return { ok: false, error: 'Invalid logo position', status: 400 }
    }
  }

  let logoSize: VideoLogoSize | null = null
  if (logoChoice !== 'none') {
    if (input.logoSize == null || input.logoSize === '') {
      logoSize = 'medium'
    } else if (typeof input.logoSize === 'string' && isVideoLogoSize(input.logoSize)) {
      logoSize = input.logoSize
    } else {
      return { ok: false, error: 'Invalid logo size', status: 400 }
    }
  }

  let overlayText: string | null = null
  if (input.overlayText != null && input.overlayText !== '') {
    if (typeof input.overlayText !== 'string') {
      return { ok: false, error: 'Invalid overlay text', status: 400 }
    }
    const trimmed = input.overlayText.trim()
    if (trimmed.length > VIDEO_OVERLAY_TEXT_MAX_CHARS) {
      return {
        ok: false,
        error: `Video headline must be ${VIDEO_OVERLAY_TEXT_MAX_CHARS} characters or fewer`,
        status: 400,
      }
    }
    overlayText = trimmed || null
  }

  let textPosition: VideoTextPosition = 'bottom'
  if (input.textPosition != null && input.textPosition !== '') {
    if (typeof input.textPosition !== 'string' || !isVideoTextPosition(input.textPosition)) {
      return { ok: false, error: 'Invalid text position', status: 400 }
    }
    textPosition = input.textPosition
  }

  if (logoChoice === 'none' && !overlayText) {
    return {
      ok: false,
      error: 'Add a logo or video headline to brand this video',
      status: 400,
    }
  }

  const styleDefaults = newVideoHeadlineStyleDefaults(input.businessDefaults)
  const brandColor = input.businessDefaults?.brandColor

  let overlayTextFont: VideoHeadlineFontId | null = null
  let overlayTextSize: VideoHeadlineSize | null = null
  let overlayTextColor: string | null = null
  let overlayTextWeight: VideoHeadlineWeight | null = null
  let overlayTextAlign: VideoHeadlineAlign | null = null
  let overlayTextBackground: VideoHeadlineBackground | null = null

  if (overlayText) {
    if (input.overlayTextFont != null && input.overlayTextFont !== '') {
      if (typeof input.overlayTextFont !== 'string' || !isVideoHeadlineFontId(input.overlayTextFont)) {
        return { ok: false, error: 'Invalid headline font', status: 400 }
      }
      overlayTextFont = input.overlayTextFont
    } else {
      overlayTextFont = styleDefaults.fontId
    }

    if (input.overlayTextSize != null && input.overlayTextSize !== '') {
      if (typeof input.overlayTextSize !== 'string' || !HEADLINE_SIZE_SET.has(input.overlayTextSize)) {
        return { ok: false, error: 'Invalid headline size', status: 400 }
      }
      overlayTextSize = input.overlayTextSize as VideoHeadlineSize
    } else {
      overlayTextSize = styleDefaults.size
    }

    if (input.overlayTextColor != null && input.overlayTextColor !== '') {
      if (typeof input.overlayTextColor !== 'string' || !isValidVideoHeadlineColor(input.overlayTextColor, brandColor)) {
        return { ok: false, error: 'Invalid headline colour', status: 400 }
      }
      overlayTextColor = normalizeVideoHeadlineColor(input.overlayTextColor)
    } else {
      overlayTextColor = styleDefaults.color
    }

    if (input.overlayTextWeight != null && input.overlayTextWeight !== '') {
      if (typeof input.overlayTextWeight !== 'string' || !HEADLINE_WEIGHT_SET.has(input.overlayTextWeight)) {
        return { ok: false, error: 'Invalid headline weight', status: 400 }
      }
      overlayTextWeight = input.overlayTextWeight as VideoHeadlineWeight
    } else {
      overlayTextWeight = styleDefaults.weight
    }

    if (input.overlayTextAlign != null && input.overlayTextAlign !== '') {
      if (typeof input.overlayTextAlign !== 'string' || !HEADLINE_ALIGN_SET.has(input.overlayTextAlign)) {
        return { ok: false, error: 'Invalid headline alignment', status: 400 }
      }
      overlayTextAlign = input.overlayTextAlign as VideoHeadlineAlign
    } else {
      overlayTextAlign = styleDefaults.align
    }

    if (input.overlayTextBackground != null && input.overlayTextBackground !== '') {
      if (
        typeof input.overlayTextBackground !== 'string' ||
        !HEADLINE_BACKGROUND_SET.has(input.overlayTextBackground)
      ) {
        return { ok: false, error: 'Invalid headline background', status: 400 }
      }
      overlayTextBackground = input.overlayTextBackground as VideoHeadlineBackground
    } else {
      overlayTextBackground = styleDefaults.background
    }
  }

  const partialConfig: VideoBrandingConfig = {
    logoChoice,
    logoAssetId,
    logoPosition,
    logoSize,
    overlayText,
    textPosition: overlayText ? textPosition : null,
    overlayTextFont,
    overlayTextSize,
    overlayTextColor,
    overlayTextWeight,
    overlayTextAlign,
    overlayTextBackground,
  }

  return {
    ok: true,
    config: mergeBrandingConfigWithDefaults(partialConfig, input.businessDefaults),
  }
}

export function sanitizeOverlayTextForStorage(text: string | null | undefined): string | null {
  if (!text?.trim()) return null
  return text.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, VIDEO_OVERLAY_TEXT_MAX_CHARS)
}

/** Plain text only - strips control chars; emoji removed separately. */
export function sanitizeOverlayTextForFfmpeg(text: string): string {
  return text
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim()
}

export function wrapOverlayTextLines(text: string, maxCharsPerLine = 40, maxLines = 2): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return []

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine) : word
    if (lines.length >= maxLines - 1) break
  }

  if (lines.length < maxLines && current) lines.push(current)
  return lines.slice(0, maxLines)
}

export function suggestVideoOverlayText(input: {
  aboutText?: string | null
  jobTitle?: string | null
  jobSuburb?: string | null
}): string | null {
  const suburb = input.jobSuburb?.trim()
  const title = input.jobTitle?.trim()
  if (title && suburb) {
    return `${title} in ${suburb}`.slice(0, VIDEO_OVERLAY_TEXT_MAX_CHARS)
  }
  if (title) return title.slice(0, VIDEO_OVERLAY_TEXT_MAX_CHARS)
  const about = input.aboutText?.trim()
  if (about) {
    const firstSentence = about.split(/[.!?]/)[0]?.trim()
    return (firstSentence || about).slice(0, VIDEO_OVERLAY_TEXT_MAX_CHARS)
  }
  return null
}

export function brandingConfigToJobFields(config: VideoBrandingConfig) {
  return {
    logo_choice: config.logoChoice,
    logo_asset_id: config.logoAssetId,
    logo_position: config.logoPosition,
    logo_size: config.logoSize,
    overlay_text: config.overlayText,
    text_position: config.textPosition,
  }
}

export function rowToBrandingConfig(row: {
  logo_choice: VideoLogoChoiceKind
  logo_asset_id: string | null
  logo_position: VideoLogoPosition | null
  logo_size: VideoLogoSize | null
  overlay_text: string | null
  text_position: VideoTextPosition | null
}): VideoBrandingConfig {
  return {
    logoChoice: row.logo_choice,
    logoAssetId: row.logo_asset_id,
    logoPosition: row.logo_position,
    logoSize: row.logo_size,
    overlayText: row.overlay_text,
    textPosition: row.text_position,
  }
}

export function brandingConfigFromJson(
  raw: Record<string, unknown> | null | undefined,
): VideoBrandingConfig | null {
  if (!raw || typeof raw !== 'object') return null
  const logoChoice = raw.logoChoice
  if (logoChoice !== 'none' && logoChoice !== 'primary' && logoChoice !== 'asset') {
    return null
  }
  return {
    logoChoice,
    logoAssetId: typeof raw.logoAssetId === 'string' ? raw.logoAssetId : null,
    logoPosition:
      typeof raw.logoPosition === 'string' && isVideoLogoPosition(raw.logoPosition)
        ? raw.logoPosition
        : null,
    logoSize:
      typeof raw.logoSize === 'string' && isVideoLogoSize(raw.logoSize) ? raw.logoSize : null,
    overlayText: typeof raw.overlayText === 'string' ? raw.overlayText : null,
    textPosition:
      typeof raw.textPosition === 'string' && isVideoTextPosition(raw.textPosition)
        ? raw.textPosition
        : null,
    overlayTextFont:
      typeof raw.overlayTextFont === 'string' && isVideoHeadlineFontId(raw.overlayTextFont)
        ? raw.overlayTextFont
        : null,
    overlayTextSize:
      typeof raw.overlayTextSize === 'string' && HEADLINE_SIZE_SET.has(raw.overlayTextSize)
        ? (raw.overlayTextSize as VideoHeadlineSize)
        : null,
    overlayTextColor:
      typeof raw.overlayTextColor === 'string' ? raw.overlayTextColor : null,
    overlayTextWeight:
      typeof raw.overlayTextWeight === 'string' && HEADLINE_WEIGHT_SET.has(raw.overlayTextWeight)
        ? (raw.overlayTextWeight as VideoHeadlineWeight)
        : null,
    overlayTextAlign:
      typeof raw.overlayTextAlign === 'string' && HEADLINE_ALIGN_SET.has(raw.overlayTextAlign)
        ? (raw.overlayTextAlign as VideoHeadlineAlign)
        : null,
    overlayTextBackground:
      typeof raw.overlayTextBackground === 'string' &&
      HEADLINE_BACKGROUND_SET.has(raw.overlayTextBackground)
        ? (raw.overlayTextBackground as VideoHeadlineBackground)
        : null,
  }
}
