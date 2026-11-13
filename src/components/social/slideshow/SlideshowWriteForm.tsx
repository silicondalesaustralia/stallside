'use client'

import { Images, Loader2, Sparkles } from 'lucide-react'
import { SLIDESHOW_CONTEXT_MAX, SLIDESHOW_MIN_IMAGES } from '@/lib/social/slideshow/slideshowTypes'

type Props = {
  context: string
  imageCount: number
  writing: boolean
  error: string | null
  onContext: (value: string) => void
  onWrite: () => void
  onPhotosOnly: () => void
}

export function SlideshowWriteForm({ context, imageCount, writing, error, onContext, onWrite, onPhotosOnly }: Props) {
  const short = SLIDESHOW_MIN_IMAGES - imageCount
  return (
    <div className="space-y-3 rounded-xl border-2 border-[#F5C518] bg-[#FFF8DB] p-3" data-testid="slideshow-write-form">
      <label className="block text-sm font-bold text-[#18181B]">
        Anything the AI should know? <span className="font-normal text-zinc-500">(optional)</span>
        <textarea
          value={context}
          onChange={(e) => onContext(e.target.value.slice(0, SLIDESHOW_CONTEXT_MAX))}
          rows={3}
          disabled={writing}
          placeholder="e.g. Strawberries picked this morning, $6 a punnet, at the gate until Sunday"
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
        />
      </label>
      <p className="text-[11px] text-zinc-600">The AI looks at each image and writes one slide for it. You can edit every slide before it is made.</p>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onWrite}
          disabled={writing || short > 0}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          data-testid="slideshow-write"
        >
          {writing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {writing ? 'Writing your slides…' : short > 0 ? `Pick ${short} more image${short === 1 ? '' : 's'}` : 'Make slides with AI'}
        </button>
        {short <= 0 && (
          <button
            type="button"
            onClick={onPhotosOnly}
            disabled={writing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#18181B] bg-white px-4 py-2 text-sm font-bold text-[#18181B] disabled:opacity-50"
            data-testid="slideshow-photos-only"
          >
            <Images className="h-4 w-4" />
            Use photos only (no text)
          </button>
        )}
      </div>
    </div>
  )
}
