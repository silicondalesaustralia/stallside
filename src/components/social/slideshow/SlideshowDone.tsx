'use client'

import { useState } from 'react'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SlideshowRenderResult } from '@/lib/social/slideshow/slideshowTypes'
import type { SlideshowVideo } from '@/components/social/slideshow/useSlideshowBuild'
import { slideshowPhotoMedia, slideshowVideoMedia } from '@/components/social/slideshow/slideshowMedia'

type Props = {
  video: SlideshowVideo
  rendered: SlideshowRenderResult
  tiktokSelected: boolean
  onMedia: (media: ComposerMedia) => void
  onStartOver: () => void
}

const choiceBtn = (on: boolean) =>
  `rounded-lg px-3 py-1.5 text-xs font-bold ${on ? 'bg-[#18181B] text-white' : 'border border-[#E4E4E7] bg-white text-zinc-700'}`

export function SlideshowDone({ video, rendered, tiktokSelected, onMedia, onStartOver }: Props) {
  const [mode, setMode] = useState<'video' | 'photos'>('video')

  const choose = (next: 'video' | 'photos') => {
    setMode(next)
    onMedia(next === 'video' ? slideshowVideoMedia(video, rendered) : slideshowPhotoMedia(rendered))
  }

  return (
    <div className="space-y-3" data-testid="slideshow-done">
      <div className="flex items-start gap-3">
        <video src={video.url} poster={video.thumbnailUrl ?? undefined} controls playsInline className="aspect-[9/16] w-40 shrink-0 rounded-xl bg-black" />
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-1.5 font-bold text-[#18181B]">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> Your slideshow is ready
          </p>
          <p className="text-xs text-zinc-600">
            Saved to your Library as a {Math.round(video.durationSeconds ?? 0)}s 9:16 video, sized for TikTok, Instagram and Facebook Reels, YouTube Shorts, X and Pinterest.
          </p>
        </div>
      </div>

      {tiktokSelected && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-zinc-600">Post it as</p>
          <div className="flex gap-2">
            <button type="button" className={choiceBtn(mode === 'video')} onClick={() => choose('video')}>Video</button>
            <button type="button" className={choiceBtn(mode === 'photos')} onClick={() => choose('photos')}>Swipeable photos</button>
          </div>
          {mode === 'photos' && (
            <p className="text-[11px] text-zinc-500">TikTok gets every slide as a swipeable photo post. Other platforms get the first slide as an image.</p>
          )}
        </div>
      )}

      <button type="button" onClick={onStartOver} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:underline">
        <RotateCcw className="h-3.5 w-3.5" /> Make another slideshow
      </button>
    </div>
  )
}
