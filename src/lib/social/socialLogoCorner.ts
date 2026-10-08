export const SOCIAL_LOGO_CORNERS = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
] as const

export type SocialLogoCorner = (typeof SOCIAL_LOGO_CORNERS)[number]

export const DEFAULT_SOCIAL_LOGO_CORNER: SocialLogoCorner = 'bottom-right'

const CORNER_SET = new Set<string>(SOCIAL_LOGO_CORNERS)

export function isSocialLogoCorner(value: string): value is SocialLogoCorner {
  return CORNER_SET.has(value)
}

export function parseSocialLogoCorner(
  value: string | null | undefined,
): SocialLogoCorner {
  const trimmed = value?.trim()
  if (trimmed && isSocialLogoCorner(trimmed)) return trimmed
  return DEFAULT_SOCIAL_LOGO_CORNER
}

export const SOCIAL_LOGO_CORNER_LABELS: Record<SocialLogoCorner, string> = {
  'bottom-right': 'Bottom right',
  'bottom-left':  'Bottom left',
  'top-right':    'Top right',
  'top-left':     'Top left',
}
