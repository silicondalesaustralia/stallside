import { isLightColor } from '@/lib/utils/colorContrast'
import { SOCIAL_COLOR_SWATCHES } from '@/lib/social/socialTextStyle'
import type { SocialTextStyles } from '@/lib/social/socialTextStyle'
import type {
  VideoBrandingConfig,
  VideoHeadlineAlign,
  VideoHeadlineBackground,
  VideoHeadlineFontId,
  VideoHeadlineSize,
  VideoHeadlineWeight,
  VideoLogoPosition,
  VideoTextPosition,
} from '@/lib/social/videoBranding/types'
import {
  videoHeadlineFontFromSocialFamily,
  isVideoHeadlineFontId,
} from '@/lib/social/videoBranding/videoHeadlineFontCatalog'
import {
  videoBottomTextMarginPx,
  videoSafeMarginPx,
  VIDEO_TEXT_MAX_WIDTH_RATIO,
} from '@/lib/social/videoBranding/safeZones'

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

export const VIDEO_HEADLINE_DEFAULT_COLOR = '#FFFFFF'

export const VIDEO_HEADLINE_COLOR_SWATCHES = SOCIAL_COLOR_SWATCHES.filter((s) =>
  ['White', 'Black', 'Yellow', 'Navy', 'Teal'].includes(s.label),
)

export const VIDEO_HEADLINE_SIZE_HEIGHT_RATIO: Record<VideoHeadlineSize, number> = {
  small: 0.035,
  medium: 0.05,
  large: 0.065,
}

export type ResolvedVideoHeadlineStyle = {
  fontId: VideoHeadlineFontId
  size: VideoHeadlineSize
  color: string
  weight: VideoHeadlineWeight
  align: VideoHeadlineAlign
  background: VideoHeadlineBackground
  textPosition: VideoTextPosition
}

export type VideoHeadlineBusinessDefaults = {
  socialTextStyles?: SocialTextStyles | null
  brandColor?: string | null
}

export function isValidVideoHeadlineColor(value: string, brandColor?: string | null): boolean {
  if (!HEX_COLOR_RE.test(value)) return false
  if (VIDEO_HEADLINE_COLOR_SWATCHES.some((s) => s.hex.toUpperCase() === value.toUpperCase())) {
    return true
  }
  const brand = brandColor?.trim()
  return Boolean(brand && HEX_COLOR_RE.test(brand) && value.toUpperCase() === brand.toUpperCase())
}

export function normalizeVideoHeadlineColor(value: string): string {
  return value.toUpperCase()
}

/** Defaults for a brand-new branding config (strong social headline). */
export function newVideoHeadlineStyleDefaults(
  business?: VideoHeadlineBusinessDefaults,
): Omit<ResolvedVideoHeadlineStyle, 'textPosition'> {
  const headlineFont = business?.socialTextStyles?.headline?.fontFamily
  return {
    fontId: videoHeadlineFontFromSocialFamily(headlineFont),
    size: 'large',
    weight: 'bold',
    color: VIDEO_HEADLINE_DEFAULT_COLOR,
    align: 'center',
    background: 'auto',
  }
}

/** Backward-compatible style when JSONB lacks headline fields (≈ pre-3.1 FFmpeg look). */
export function legacyVideoHeadlineStyleDefaults(): Omit<ResolvedVideoHeadlineStyle, 'textPosition'> {
  return {
    fontId: 'inter',
    size: 'medium',
    weight: 'bold',
    color: VIDEO_HEADLINE_DEFAULT_COLOR,
    align: 'center',
    background: 'auto',
  }
}

export function configHasHeadlineStyleFields(config: Partial<VideoBrandingConfig>): boolean {
  return Boolean(
    config.overlayTextFont ||
      config.overlayTextSize ||
      config.overlayTextColor ||
      config.overlayTextWeight ||
      config.overlayTextAlign ||
      config.overlayTextBackground,
  )
}

export function resolveVideoHeadlineStyle(
  config: Partial<VideoBrandingConfig>,
  business?: VideoHeadlineBusinessDefaults,
): ResolvedVideoHeadlineStyle {
  const isLegacy = Boolean(config.overlayText?.trim()) && !configHasHeadlineStyleFields(config)
  const base = isLegacy ? legacyVideoHeadlineStyleDefaults() : newVideoHeadlineStyleDefaults(business)

  const fontRaw = config.overlayTextFont?.trim()
  const fontId =
    fontRaw && isVideoHeadlineFontId(fontRaw) ? fontRaw : base.fontId

  const colorRaw = config.overlayTextColor?.trim()
  const color =
    colorRaw && isValidVideoHeadlineColor(colorRaw, business?.brandColor)
      ? normalizeVideoHeadlineColor(colorRaw)
      : base.color

  return {
    fontId,
    size: config.overlayTextSize ?? base.size,
    color,
    weight: config.overlayTextWeight ?? base.weight,
    align: config.overlayTextAlign ?? base.align,
    background: config.overlayTextBackground ?? base.background,
    textPosition: config.textPosition ?? 'bottom',
  }
}

export function videoHeadlineFontSizePx(size: VideoHeadlineSize, displayHeight: number): number {
  const ratio = VIDEO_HEADLINE_SIZE_HEIGHT_RATIO[size]
  const base = Math.round(displayHeight * ratio)
  const min = size === 'small' ? 20 : size === 'medium' ? 26 : 32
  const max = size === 'small' ? 48 : size === 'medium' ? 64 : 84
  return Math.max(min, Math.min(max, base))
}

export function videoHeadlineLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.28)
}

export function ffmpegFontColor(hex: string): string {
  return hex.replace('#', '0x')
}

export function ffmpegHeadlineBoxColors(textColor: string): {
  enabled: boolean
  boxcolor: string
  boxborderw: number
} {
  const lightText = isLightColor(textColor)
  return {
    enabled: true,
    boxcolor: lightText ? 'black@0.38' : 'white@0.42',
    boxborderw: Math.max(14, Math.round(fontSizePaddingScale(textColor) * 16)),
  }
}

function fontSizePaddingScale(_textColor: string): number {
  return 1.1
}

export function drawtextBoxParams(
  background: VideoHeadlineBackground,
  textColor: string,
): { box: boolean; boxcolor?: string; boxborderw?: number } {
  if (background === 'none') return { box: false }
  const colors = ffmpegHeadlineBoxColors(textColor)
  return {
    box: colors.enabled,
    boxcolor: colors.boxcolor,
    boxborderw: colors.boxborderw,
  }
}

export function drawtextXExpression(
  align: VideoHeadlineAlign,
  horizontalPad: number,
): string {
  if (align === 'left') return String(horizontalPad)
  if (align === 'right') return `w-text_w-${horizontalPad}`
  return '(w-text_w)/2'
}

/** Simple logo/headline collision avoidance - shift alignment away from logo corner. */
export function resolveHeadlinePlacement(params: {
  textPosition: VideoTextPosition
  textAlign: VideoHeadlineAlign
  logoPosition: VideoLogoPosition | null
  hasLogo: boolean
}): { textPosition: VideoTextPosition; textAlign: VideoHeadlineAlign } {
  let { textPosition, textAlign } = params
  if (!params.hasLogo || !params.logoPosition) {
    return { textPosition, textAlign }
  }

  const logo = params.logoPosition
  const bottomLogo = logo === 'bottom_left' || logo === 'bottom_right'
  const topLogo = logo === 'top_left' || logo === 'top_right'

  if (textPosition === 'bottom' && bottomLogo) {
    if (logo === 'bottom_right' && textAlign === 'right') textAlign = 'center'
    if (logo === 'bottom_left' && textAlign === 'left') textAlign = 'center'
  }

  if (textPosition === 'top' && topLogo) {
    if (logo === 'top_right' && textAlign === 'right') textAlign = 'center'
    if (logo === 'top_left' && textAlign === 'left') textAlign = 'center'
  }

  return { textPosition, textAlign }
}

export function maxCharsPerHeadlineLine(params: {
  videoWidth: number
  fontSize: number
  align: VideoHeadlineAlign
}): number {
  const horizontalPad = videoSafeMarginPx(params.videoWidth, params.videoWidth)
  const maxTextWidth = Math.round(
    params.videoWidth * VIDEO_TEXT_MAX_WIDTH_RATIO - horizontalPad * 2,
  )
  const approxCharWidth = Math.max(8, params.fontSize * 0.52)
  return Math.max(12, Math.floor(maxTextWidth / approxCharWidth))
}

export function wrapVideoHeadlineLines(
  text: string,
  params: {
    videoWidth: number
    fontSize: number
    align: VideoHeadlineAlign
  },
): { lines: string[]; warning: string | null } {
  const maxChars = maxCharsPerHeadlineLine(params)
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return { lines: [], warning: null }

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = word.length > maxChars ? word.slice(0, maxChars) : word
    if (lines.length >= 1) break
  }

  if (lines.length < 2 && current) lines.push(current)
  const result = lines.slice(0, 2)

  let warning: string | null = null
  const usedWords = result.join(' ').split(/\s+/).length
  if (usedWords < words.length) {
    warning = 'Headline is long for this size - shorten text or choose a smaller size.'
  }

  return { lines: result, warning }
}

export function mergeBrandingConfigWithDefaults(
  config: VideoBrandingConfig,
  business?: VideoHeadlineBusinessDefaults,
): VideoBrandingConfig {
  if (!config.overlayText?.trim()) return config
  const style = resolveVideoHeadlineStyle(config, business)
  return {
    ...config,
    overlayTextFont: style.fontId,
    overlayTextSize: style.size,
    overlayTextColor: style.color,
    overlayTextWeight: style.weight,
    overlayTextAlign: style.align,
    overlayTextBackground: style.background,
    textPosition: style.textPosition,
  }
}
