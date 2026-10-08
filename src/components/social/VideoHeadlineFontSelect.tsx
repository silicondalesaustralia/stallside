'use client'

import { SocialFontFamilySelect } from '@/components/social/SocialFontFamilySelect'
import type { SocialFontFamily } from '@/lib/social/socialTextStyle'
import type { VideoHeadlineFontId } from '@/lib/social/videoBranding/types'
import {
  VIDEO_HEADLINE_FONTS,
  videoHeadlineFontFromSocialFamily,
  videoHeadlineFontLabel,
} from '@/lib/social/videoBranding/videoHeadlineFontCatalog'

const VIDEO_HEADLINE_FONT_FAMILIES = VIDEO_HEADLINE_FONTS.map(
  (font) => font.label,
) as readonly SocialFontFamily[]

export function VideoHeadlineFontSelect({
  value,
  onChange,
  disabled,
  assetId,
}: {
  value: VideoHeadlineFontId
  onChange: (fontId: VideoHeadlineFontId) => void
  disabled?: boolean
  assetId: string
}) {
  const family = videoHeadlineFontLabel(value) as SocialFontFamily

  return (
    <SocialFontFamilySelect
      value={family}
      onChange={(next) => onChange(videoHeadlineFontFromSocialFamily(next))}
      families={VIDEO_HEADLINE_FONT_FAMILIES}
      compact
      label={null}
      disabled={disabled}
      touchFriendly
      testId={`video-headline-font-${assetId}`}
    />
  )
}
