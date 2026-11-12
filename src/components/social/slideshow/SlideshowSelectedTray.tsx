'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { SLIDESHOW_MAX_IMAGES, SLIDESHOW_MIN_IMAGES } from '@/lib/social/slideshow/slideshowTypes'

type Props = {
  images: string[]
  onMove: (index: number, delta: -1 | 1) => void
  onRemove: (index: number) => void
}

const iconBtn = 'rounded bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30'

/** Picked images in slide order. */
export function SlideshowSelectedTray({ images, onMove, onRemove }: Props) {
  return (
    <div data-testid="slideshow-selected">
      <p className="mb-1.5 text-xs font-bold text-zinc-600">
        Your slides ({images.length}/{SLIDESHOW_MAX_IMAGES}) - pick {SLIDESHOW_MIN_IMAGES} to 5 for best results
      </p>
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#E4E4E7] px-3 py-4 text-center text-xs text-zinc-500">
          Pick images below. They play in the order you pick them.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg border border-[#E4E4E7] bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Slide ${i + 1}`} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">{i + 1}</span>
              <button type="button" aria-label="Remove image" onClick={() => onRemove(i)} className={`absolute right-1 top-1 ${iconBtn}`}>
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => onMove(i, -1)} className={iconBtn}>
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button type="button" aria-label="Move later" disabled={i === images.length - 1} onClick={() => onMove(i, 1)} className={iconBtn}>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
