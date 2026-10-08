'use client'

import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Plus, Sparkles, X } from 'lucide-react'
import { ComposerLibraryPicker } from '@/components/tradiespost/composer/ComposerLibraryPicker'
import { ComposerSlideGenerator } from '@/components/tradiespost/composer/ComposerSlideGenerator'
import { useComposerSlides } from '@/components/tradiespost/composer/useComposerSlides'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import { TIKTOK_MAX_PHOTO_SLIDES } from '@/lib/social/tiktokSlides/slideTypes'

type Props = {
  media: ComposerMedia | null
  setMedia: Dispatch<SetStateAction<ComposerMedia | null>>
  jobId: string | null
  /** AI decks come with a suggested caption; used only when the caption is empty. */
  onSuggestedCaption: (caption: string) => void
}

/** /api/social/upload-media accepts at most 10 files per request. */
const UPLOAD_BATCH_MAX = 10

const iconBtn = 'rounded bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30'
const actionBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-xs font-bold text-[#18181B] hover:border-[#F5C518] disabled:opacity-50'

export function ComposerTikTokSlides({ media, setMedia, jobId, onSuggestedCaption }: Props) {
  const { slides, move, remove, add, applyDeck, uploadAndAdd, uploading, error } = useComposerSlides(media, setMedia)
  const backgroundUrl = media && !media.video && media.slidesKind !== 'ai' ? media.url : null
  const [panel, setPanel] = useState<'none' | 'library' | 'ai'>('none')
  const inputRef = useRef<HTMLInputElement>(null)
  const full = slides.length >= TIKTOK_MAX_PHOTO_SLIDES

  return (
    <div className="mt-4 space-y-3 border-t border-[#E4E4E7] pt-4" data-testid="composer-tiktok-slides">
      <div>
        <p className="text-sm font-bold text-[#18181B]">TikTok slides {slides.length > 1 && `(${slides.length})`}</p>
        <p className="text-xs text-zinc-500">
          TikTok gets every slide as a swipeable photo post. Other platforms get the cover image.
        </p>
      </div>

      {slides.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((url, i) => (
            <div key={`${url}-${i}`} className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg border border-[#E4E4E7] bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Slide ${i + 1}`} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">{i + 1}</span>
              <button type="button" aria-label="Remove slide" onClick={() => remove(i)} className={`absolute right-1 top-1 ${iconBtn}`}>
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtn}>
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button type="button" aria-label="Move right" disabled={i === slides.length - 1} onClick={() => move(i, 1)} className={iconBtn}>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={actionBtn} disabled={uploading || full} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Add photos'}
        </button>
        <button type="button" className={actionBtn} disabled={full} onClick={() => setPanel('library')}>
          <ImageIcon className="h-3.5 w-3.5" /> Add from Library
        </button>
        <button type="button" className={`${actionBtn} border-[#F5C518] bg-[#FFF8DB]`} onClick={() => setPanel('ai')}>
          <Sparkles className="h-3.5 w-3.5" /> Make slides with AI
        </button>
      </div>

      {panel === 'library' && (
        <ComposerLibraryPicker
          onCancel={() => setPanel('none')}
          onSelect={(render) => {
            add(render.result_url)
            setPanel('none')
          }}
        />
      )}
      {panel === 'ai' && (
        <ComposerSlideGenerator
          jobId={jobId}
          photoUrl={backgroundUrl}
          onCancel={() => setPanel('none')}
          onDone={(deck) => {
            applyDeck(deck)
            if (deck.caption) onSuggestedCaption(deck.caption)
            setPanel('none')
          }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const room = Math.min(UPLOAD_BATCH_MAX, TIKTOK_MAX_PHOTO_SLIDES - slides.length)
          const files = Array.from(e.target.files ?? []).slice(0, room)
          void uploadAndAdd(files)
          e.target.value = ''
        }}
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
