'use client'

import { RefreshCw, X } from 'lucide-react'

type Props = {
  imageUrl: string
  aiGenerated: boolean
  onReplace: () => void
  onRemove: () => void
}

export function ComposerMediaPreviewThumb({ imageUrl, aiGenerated, onReplace, onRemove }: Props) {
  return (
    <div className="flex items-center gap-4" data-testid="composer-media-selected">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Selected post image" className="h-full w-full object-cover" />
        {aiGenerated && (
          <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
            AI
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#18181B] hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  )
}
