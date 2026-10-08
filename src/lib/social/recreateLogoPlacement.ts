import type { SocialLogoCorner } from '@/lib/social/socialLogoCorner'

export const RECREATE_LOGO_POSITIONS = [
  'top_left',
  'top_center',
  'top_right',
  'bottom_left',
  'bottom_right',
] as const

export type RecreateLogoPosition = (typeof RECREATE_LOGO_POSITIONS)[number]

export const RECREATE_LOGO_SIZES = ['small', 'medium', 'large'] as const

export type RecreateLogoSize = (typeof RECREATE_LOGO_SIZES)[number]

export const RECREATE_DEFAULT_LOGO_POSITION: RecreateLogoPosition = 'top_left'
export const RECREATE_DEFAULT_LOGO_SIZE: RecreateLogoSize = 'medium'

export const RECREATE_LOGO_SIZE_WIDTH_RATIO: Record<RecreateLogoSize, number> = {
  small: 0.14,
  medium: 0.2,
  large: 0.26,
}

export const RECREATE_LOGO_POSITION_LABELS: Record<RecreateLogoPosition, string> = {
  top_left: 'Top left',
  top_center: 'Top center',
  top_right: 'Top right',
  bottom_left: 'Bottom left',
  bottom_right: 'Bottom right',
}

export const RECREATE_LOGO_SIZE_LABELS: Record<RecreateLogoSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

const POSITION_SET = new Set<string>(RECREATE_LOGO_POSITIONS)
const SIZE_SET = new Set<string>(RECREATE_LOGO_SIZES)

export function isRecreateLogoPosition(value: string): value is RecreateLogoPosition {
  return POSITION_SET.has(value)
}

export function isRecreateLogoSize(value: string): value is RecreateLogoSize {
  return SIZE_SET.has(value)
}

export function parseRecreateLogoPosition(
  value: unknown,
): RecreateLogoPosition | { ok: false; error: string } {
  if (value == null || value === '') return RECREATE_DEFAULT_LOGO_POSITION
  if (typeof value !== 'string' || !isRecreateLogoPosition(value)) {
    return { ok: false, error: 'Invalid logoPosition' }
  }
  return value
}

export function parseRecreateLogoSize(
  value: unknown,
): RecreateLogoSize | { ok: false; error: string } {
  if (value == null || value === '') return RECREATE_DEFAULT_LOGO_SIZE
  if (typeof value !== 'string' || !isRecreateLogoSize(value)) {
    return { ok: false, error: 'Invalid logoSize' }
  }
  return value
}

const SOCIAL_CORNER_TO_RECREATE: Record<SocialLogoCorner, RecreateLogoPosition> = {
  'top-left': 'top_left',
  'top-right': 'top_right',
  'bottom-left': 'bottom_left',
  'bottom-right': 'bottom_right',
}

export function socialLogoCornerToRecreatePosition(
  corner: SocialLogoCorner,
): RecreateLogoPosition {
  return SOCIAL_CORNER_TO_RECREATE[corner]
}

export function recreatePositionToSocialLogoCorner(
  position: RecreateLogoPosition,
): SocialLogoCorner {
  if (position === 'top_center') return 'top-left'
  if (position === 'top_right') return 'top-right'
  if (position === 'bottom_left') return 'bottom-left'
  if (position === 'bottom_right') return 'bottom-right'
  return 'top-left'
}

/** Wide marks use the size target; square/tall marks stay smaller so height stays calm. */
export function recreateLogoWidthRatioForSize(
  aspectWidthOverHeight: number,
  size: RecreateLogoSize = RECREATE_DEFAULT_LOGO_SIZE,
): number {
  const sizeMax = RECREATE_LOGO_SIZE_WIDTH_RATIO[size]
  if (!Number.isFinite(aspectWidthOverHeight) || aspectWidthOverHeight <= 0) {
    return sizeMax * (0.22 / 0.26)
  }
  if (aspectWidthOverHeight >= 2.2) return sizeMax
  if (aspectWidthOverHeight >= 1.6) return sizeMax * (0.24 / 0.26)
  if (aspectWidthOverHeight >= 1.1) return sizeMax * (0.22 / 0.26)
  return sizeMax * (0.2 / 0.26)
}

export function recreateLogoOrigin(params: {
  canvasWidth: number
  canvasHeight: number
  logoWidth: number
  logoHeight: number
  position: RecreateLogoPosition
  padding: number
}): { x: number; y: number; clipped: boolean } {
  const { canvasWidth, canvasHeight, logoWidth, logoHeight, position, padding } = params
  const pad = Math.max(0, padding)
  let x = pad
  let y = pad
  if (position === 'top_center') {
    x = (canvasWidth - logoWidth) / 2
    y = pad
  } else if (position === 'top_right') {
    x = canvasWidth - pad - logoWidth
    y = pad
  } else if (position === 'bottom_left') {
    x = pad
    y = canvasHeight - pad - logoHeight
  } else if (position === 'bottom_right') {
    x = canvasWidth - pad - logoWidth
    y = canvasHeight - pad - logoHeight
  }

  const maxX = Math.max(0, canvasWidth - logoWidth)
  const maxY = Math.max(0, canvasHeight - logoHeight)
  const clampedX = Math.min(maxX, Math.max(0, Math.round(x)))
  const clampedY = Math.min(maxY, Math.max(0, Math.round(y)))
  return {
    x: clampedX,
    y: clampedY,
    clipped: logoWidth > canvasWidth + 0.5 || logoHeight > canvasHeight + 0.5,
  }
}
