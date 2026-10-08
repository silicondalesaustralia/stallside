/**
 * Browser preview for bundled social fonts (same TTFs as resvg server render).
 * Served via /api/social/bundled-font/[file] - separate from resvg fontFiles wiring.
 */

import { BUNDLED_SOCIAL_FONTS } from '@/lib/social/bundledSocialFontManifest'
import type { SocialFontFamily } from '@/lib/social/socialTextStyle'
import { SOCIAL_FONT_FAMILIES } from '@/lib/social/socialTextStyle'

export const SOCIAL_FONT_PREVIEW_DEFAULT = 'Aa Bb Cc'

const STYLE_CLASS_BY_FAMILY = new Map(
  BUNDLED_SOCIAL_FONTS.map((f) => [f.family, f.styleClass]),
)

function fallbackForStyleClass(styleClass: 'sans' | 'serif' | 'display'): string {
  if (styleClass === 'serif') return 'Georgia, serif'
  return 'system-ui, sans-serif'
}

/** CSS font-family stack for UI preview (bundled face + sensible fallback). */
export function socialFontStack(family: SocialFontFamily): string {
  const styleClass = STYLE_CLASS_BY_FAMILY.get(family) ?? 'sans'
  return `"${family}", ${fallbackForStyleClass(styleClass)}`
}

export function resolveSocialFontPreviewPhrase(phrase?: string | null): string {
  const trimmed = phrase?.trim()
  return trimmed || SOCIAL_FONT_PREVIEW_DEFAULT
}

/** e.g. "Oswald - Aa Bb Cc" or "Oswald - Thornton Electrical" */
export function formatSocialFontOptionLabel(
  family: SocialFontFamily,
  previewPhrase?: string | null,
): string {
  return `${family} - ${resolveSocialFontPreviewPhrase(previewPhrase)}`
}

export function bundledFontApiPath(fileName: string): string {
  return `/api/social/bundled-font/${encodeURIComponent(fileName)}`
}

/** Inline @font-face rules for all 24 bundled families. */
export function generateSocialFontFaceCss(): string {
  return BUNDLED_SOCIAL_FONTS.map(
    ({ family, fileName }) => `
@font-face {
  font-family: ${JSON.stringify(family)};
  src: url('${bundledFontApiPath(fileName)}') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`,
  ).join('\n')
}

/** Guard: every curated picker font has a bundled TTF for preview + render. */
export function socialPreviewFontsMatchCuratedList(): boolean {
  const bundled = new Set(BUNDLED_SOCIAL_FONTS.map((f) => f.family))
  return SOCIAL_FONT_FAMILIES.every((family) => bundled.has(family))
}
