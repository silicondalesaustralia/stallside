'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, Music } from 'lucide-react'
import { MusicSettings } from '@/components/social/music/MusicSettings'
import { useMusicVideoSync } from '@/components/social/music/useMusicVideoSync'
import type { useComposerMusic } from '@/components/tradiespost/composer/useComposerMusic'

type Props = { music: ReturnType<typeof useComposerMusic> }

/** Create > video or slideshow: add a background song, previewed in sync, then mixed into a new Library video. */
export function ComposerMusicPanel({ music }: Props) {
  const [open, setOpen] = useState(false)
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  useMusicVideoSync(video, music.pending ? music.music : null)

  const base = music.base
  if (!base?.video) return null
  const expanded = open || music.pending || music.working
  const silent = Boolean(base.video.silent)

  return (
    <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-3" data-testid="composer-music">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 text-left">
        <Music className="h-4 w-4 text-zinc-600" />
        <span className="flex-1 text-sm font-bold text-[#18181B]">
          {music.applied ? 'Music added' : 'Add music'}
          <span className="ml-1 font-normal text-zinc-500">(optional)</span>
        </span>
        {music.applied && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {music.pending && (
            <div className="flex items-start gap-3">
              <video
                ref={setVideo}
                src={base.video.url}
                poster={base.url}
                controls
                playsInline
                className="aspect-[9/16] w-32 shrink-0 rounded-xl bg-black"
              />
              <p className="text-xs text-zinc-600">Press play to hear the song with your video. Adjust the volume, then tap Add music.</p>
            </div>
          )}
          <MusicSettings
            music={music.music}
            onChange={(next) => (next ? music.setMusic(next) : music.remove())}
            hasOriginalAudio={!silent}
          />
          {music.pending && (
            <button
              type="button"
              disabled={music.working}
              onClick={() => void music.apply()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {music.working && <Loader2 className="h-4 w-4 animate-spin" />}
              {music.working ? 'Adding music…' : music.applied ? 'Update music' : 'Add music'}
            </button>
          )}
          {music.applied && !music.pending && (
            <p className="text-xs text-zinc-600">Your post will use a copy of the video with this song. The original stays in your Library.</p>
          )}
          {music.error && <p className="text-xs font-semibold text-red-600">{music.error}</p>}
        </div>
      )}
    </div>
  )
}
