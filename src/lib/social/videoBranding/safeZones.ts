import type { VideoLogoPosition, VideoTextPosition } from '@/lib/social/videoBranding/types'

/** Fraction of frame width/height kept clear of edges (Reels/Facebook chrome). */
export const VIDEO_SAFE_MARGIN_RATIO = 0.06

/** Extra lift for bottom text so platform caption bars do not overlap. */
export const VIDEO_BOTTOM_TEXT_EXTRA_MARGIN_RATIO = 0.04

/** Max overlay text width as fraction of frame width. */
export const VIDEO_TEXT_MAX_WIDTH_RATIO = 0.8

export const VIDEO_LOGO_SIZE_WIDTH_RATIO = {
  small: 0.12,
  medium: 0.18,
  large: 0.24,
} as const

export const VIDEO_LOGO_POSITION_LABELS: Record<VideoLogoPosition, string> = {
  top_left: 'Top left',
  top_right: 'Top right',
  bottom_left: 'Bottom left',
  bottom_right: 'Bottom right',
}

export const VIDEO_TEXT_POSITION_LABELS: Record<VideoTextPosition, string> = {
  top: 'Top',
  center: 'Centre',
  bottom: 'Bottom',
}

export const VIDEO_HEADLINE_ALIGN_LABELS = {
  left: 'Left',
  center: 'Centre',
  right: 'Right',
} as const

export const VIDEO_HEADLINE_SIZE_LABELS = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
} as const

export const VIDEO_HEADLINE_WEIGHT_LABELS = {
  regular: 'Regular',
  bold: 'Bold',
} as const

export const VIDEO_HEADLINE_BACKGROUND_LABELS = {
  auto: 'Auto',
  none: 'None',
} as const

export function videoSafeMarginPx(width: number, height: number): number {
  return Math.round(Math.min(width, height) * VIDEO_SAFE_MARGIN_RATIO)
}

export function videoBottomTextMarginPx(width: number, height: number): number {
  const base = videoSafeMarginPx(width, height)
  const extra = Math.round(height * VIDEO_BOTTOM_TEXT_EXTRA_MARGIN_RATIO)
  return base + extra
}

export function videoLogoOverlayCoords(params: {
  videoWidth: number
  videoHeight: number
  logoWidth: number
  logoHeight: number
  position: VideoLogoPosition
}): { x: number; y: number } {
  const { videoWidth, videoHeight, logoWidth, logoHeight, position } = params
  const pad = videoSafeMarginPx(videoWidth, videoHeight)

  let x = pad
  let y = pad

  if (position === 'top_right') {
    x = videoWidth - pad - logoWidth
    y = pad
  } else if (position === 'bottom_left') {
    x = pad
    y = videoHeight - pad - logoHeight
  } else if (position === 'bottom_right') {
    x = videoWidth - pad - logoWidth
    y = videoHeight - pad - logoHeight
  }

  return {
    x: Math.max(0, Math.min(Math.round(x), Math.max(0, videoWidth - logoWidth))),
    y: Math.max(0, Math.min(Math.round(y), Math.max(0, videoHeight - logoHeight))),
  }
}

export function videoTextBoxY(params: {
  videoHeight: number
  textBlockHeight: number
  position: VideoTextPosition
  videoWidth: number
}): number {
  const { videoHeight, textBlockHeight, position, videoWidth } = params
  const topPad = videoSafeMarginPx(videoWidth, videoHeight)
  const bottomPad = videoBottomTextMarginPx(videoWidth, videoHeight)

  if (position === 'top') return topPad
  if (position === 'center') {
    return Math.max(topPad, Math.round((videoHeight - textBlockHeight) / 2))
  }
  return Math.max(topPad, videoHeight - bottomPad - textBlockHeight)
}
