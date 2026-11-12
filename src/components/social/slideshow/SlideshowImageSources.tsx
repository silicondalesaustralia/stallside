'use client'

import { useRef, useState } from 'react'
import { Check, ImageIcon, Loader2, Plus } from 'lucide-react'
import { ComposerLibraryPicker } from '@/components/tradiespost/composer/ComposerLibraryPicker'
import { SLIDESHOW_MAX_IMAGES } from '@/lib/social/slideshow/slideshowTypes'

type Props = {
  selected: string[]
  linkedImages: string[]
  uploading: boolean
  error: string | null
  onToggle: (url: string) => void
  onUpload: (files: File[]) => void
}

const actionBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-xs font-bold text-[#18181B] hover:border-[#F5C518] disabled:opacity-50'

/** Product photos, uploads and Library images to build slides from. */
export function SlideshowImageSources({ selected, linkedImages, uploading, error, onToggle, onUpload }: Props) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const full = selected.length >= SLIDESHOW_MAX_IMAGES

  return (
    <div className="space-y-3">
      {linkedImages.length > 0 && (
        <div data-testid="slideshow-product-photos">
          <p className="mb-1.5 text-xs font-semibold text-zinc-600">Photos from the item you picked</p>
          <div className="flex flex-wrap gap-2">
            {linkedImages.map((url) => {
              const on = selected.includes(url)
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => onToggle(url)}
                  disabled={!on && full}
                  aria-pressed={on}
                  className={`relative size-20 overflow-hidden rounded-xl border-2 disabled:opacity-50 ${on ? 'border-[#F5C518]' : 'border-[#E4E4E7] hover:border-[#F5C518]'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {on && (
                    <span className="absolute right-1 top-1 rounded-full bg-[#F5C518] p-0.5 text-[#18181B]">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={actionBtn} disabled={uploading || full} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Upload images'}
        </button>
        <button type="button" className={actionBtn} disabled={full} onClick={() => setLibraryOpen(true)}>
          <ImageIcon className="h-3.5 w-3.5" /> Add from Library
        </button>
      </div>

      {libraryOpen && (
        <ComposerLibraryPicker
          onCancel={() => setLibraryOpen(false)}
          onSelect={(render) => {
            if (!selected.includes(render.result_url)) onToggle(render.result_url)
            if (selected.length + 1 >= SLIDESHOW_MAX_IMAGES) setLibraryOpen(false)
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
          onUpload(Array.from(e.target.files ?? []).slice(0, SLIDESHOW_MAX_IMAGES - selected.length))
          e.target.value = ''
        }}
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
