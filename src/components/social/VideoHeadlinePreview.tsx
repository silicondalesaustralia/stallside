'use client'

import { headlinePreviewLayoutStyle } from '@/lib/social/videoBranding/videoHeadlinePreviewStyle'
import type { ResolvedVideoHeadlineStyle } from '@/lib/social/videoBranding/headlineStyle'
import type { VideoLogoPosition } from '@/lib/social/videoBranding/types'

export function VideoHeadlinePreview({
  imageUrl,
  headline,
  style,
  logoPosition,
  hasLogo,
}: {
  imageUrl: string | null
  headline: string
  style: ResolvedVideoHeadlineStyle
  logoPosition?: VideoLogoPosition | null
  hasLogo?: boolean
}) {
  if (!headline.trim()) return null

  const layout = headlinePreviewLayoutStyle(style, { logoPosition, hasLogo })

  return (
    <div className="space-y-1.5" data-testid="video-headline-preview">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#888]">Preview</p>
      <div className="relative aspect-[9/16] max-h-72 w-full overflow-hidden rounded-xl border border-[#EDEAE2] bg-[#111]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#333] to-[#111]" />
        )}
        <div className="absolute inset-0" style={layout.container}>
          <div style={layout.textWrap}>
            <p style={layout.text}>{headline}</p>
          </div>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-[#AAA]">
        Approximate preview - final video may differ slightly after processing.
      </p>
    </div>
  )
}
