import { socialFontStack } from '@/lib/social/socialFontWebPreview'
import type { SocialFontFamily } from '@/lib/social/socialTextStyle'
import { videoHeadlineFontLabel } from '@/lib/social/videoBranding/videoHeadlineFontCatalog'
import {
  resolveHeadlinePlacement,
  type ResolvedVideoHeadlineStyle,
} from '@/lib/social/videoBranding/headlineStyle'
import { isLightColor } from '@/lib/utils/colorContrast'
import type { VideoLogoPosition } from '@/lib/social/videoBranding/types'

export type CssMap = Record<string, string | number>

export function previewHeadlineBackgroundStyle(
  background: ResolvedVideoHeadlineStyle['background'],
  textColor: string,
): CssMap {
  if (background === 'none') return {}
  const lightText = isLightColor(textColor)
  return {
    backgroundColor: lightText ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.42)',
    padding: '0.45em 0.75em',
    borderRadius: '6px',
  }
}

export function headlinePreviewLayoutStyle(
  style: ResolvedVideoHeadlineStyle,
  params?: { logoPosition?: VideoLogoPosition | null; hasLogo?: boolean },
): { container: CssMap; textWrap: CssMap; text: CssMap } {
  const placement = resolveHeadlinePlacement({
    textPosition: style.textPosition,
    textAlign: style.align,
    logoPosition: params?.logoPosition ?? null,
    hasLogo: params?.hasLogo ?? false,
  })

  const container: CssMap = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent:
      placement.textPosition === 'top'
        ? 'flex-start'
        : placement.textPosition === 'center'
          ? 'center'
          : 'flex-end',
    alignItems:
      placement.textAlign === 'left'
        ? 'flex-start'
        : placement.textAlign === 'right'
          ? 'flex-end'
          : 'center',
    padding: '8%',
  }

  const fontLabel = videoHeadlineFontLabel(style.fontId) as SocialFontFamily
  const text: CssMap = {
    fontFamily: socialFontStack(fontLabel),
    fontWeight: style.weight === 'bold' ? 700 : 400,
    color: style.color,
    fontSize: 'clamp(12px, 4.5vw, 28px)',
    lineHeight: 1.28,
    textAlign: placement.textAlign,
    maxWidth: '84%',
    wordBreak: 'break-word',
  }

  return {
    container,
    textWrap: previewHeadlineBackgroundStyle(style.background, style.color),
    text,
  }
}
