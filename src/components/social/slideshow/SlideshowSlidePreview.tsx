'use client'

import { useMemo } from 'react'
import localFont from 'next/font/local'
import { buildSlideSvg, safeBrandColor } from '@/lib/social/tiktokSlides/slideSvg'
import { SLIDE_SIZE } from '@/lib/social/tiktokSlides/slideTypes'
import type { SlideshowSlide } from '@/lib/social/slideshow/slideshowTypes'

const anton = localFont({ src: '../../../lib/social/fonts/Anton-Regular.ttf', display: 'swap' })
const inter = localFont({ src: '../../../lib/social/fonts/Inter-Regular.ttf', display: 'swap' })

type Props = {
  slide: SlideshowSlide
  index: number
  total: number
  businessName: string
  brandColor: string | null
}

/** Same SVG the server renders, laid over the photo, so text edits show instantly. */
export function SlideshowSlidePreview({ slide, index, total, businessName, brandColor }: Props) {
  const svg = useMemo(
    () =>
      buildSlideSvg({
        ...SLIDE_SIZE,
        slide,
        index,
        total,
        brandColor: safeBrandColor(brandColor),
        businessName,
        overPhoto: true,
        showCounter: false,
      })
        .replace(/^<\?xml[^>]*>\s*/, '')
        .replaceAll('font-family="Anton"', `font-family="${anton.style.fontFamily}"`)
        .replaceAll('font-family="Inter"', `font-family="${inter.style.fontFamily}"`),
    [slide, index, total, businessName, brandColor],
  )

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-zinc-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={slide.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* buildSlideSvg escapes all text and validates the brand colour. */}
      <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
