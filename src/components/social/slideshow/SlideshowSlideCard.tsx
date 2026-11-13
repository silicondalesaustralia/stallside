'use client'

import { SLIDE_BODY_MAX, SLIDE_HEADING_MAX } from '@/lib/social/tiktokSlides/slideTypes'
import type { SlideshowSlide } from '@/lib/social/slideshow/slideshowTypes'
import { SlideshowSlidePreview } from '@/components/social/slideshow/SlideshowSlidePreview'

type Props = {
  slide: SlideshowSlide
  index: number
  total: number
  businessName: string
  brandColor: string | null
  showText: boolean
  disabled: boolean
  onChange: (patch: Partial<Pick<SlideshowSlide, 'heading' | 'body'>>) => void
}

const field = 'mt-1 block w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-1.5 text-sm font-normal disabled:opacity-60'

export function SlideshowSlideCard({ slide, index, total, businessName, brandColor, showText, disabled, onChange }: Props) {
  return (
    <div className="space-y-2 rounded-xl border border-[#E4E4E7] bg-white p-2" data-testid="slideshow-slide-card">
      <SlideshowSlidePreview
        slide={slide}
        index={index}
        total={total}
        businessName={businessName}
        brandColor={brandColor}
        showText={showText}
      />
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Slide {index + 1}</p>
      {showText && (
        <>
          <label className="block text-xs font-bold text-[#18181B]">
            Heading
            <input
              value={slide.heading}
              maxLength={SLIDE_HEADING_MAX}
              disabled={disabled}
              onChange={(e) => onChange({ heading: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-xs font-bold text-[#18181B]">
            Text
            <textarea
              value={slide.body}
              maxLength={SLIDE_BODY_MAX}
              rows={3}
              disabled={disabled}
              onChange={(e) => onChange({ body: e.target.value })}
              className={field}
            />
          </label>
        </>
      )}
    </div>
  )
}
