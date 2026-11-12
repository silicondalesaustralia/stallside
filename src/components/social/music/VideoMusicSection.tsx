'use client'

import type { RefObject } from 'react'
import { Music } from 'lucide-react'
import { MusicSettings } from '@/components/social/music/MusicSettings'
import { useMusicVideoSync } from '@/components/social/music/useMusicVideoSync'
import type { MusicChoice } from '@/lib/social/music/musicTypes'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  music: MusicChoice | null
  onChange: (music: MusicChoice | null) => void
  disabled?: boolean
}

/** Editor sidebar section: background song, previewed with the editor's video. Mount after the video. */
export function VideoMusicSection({ videoRef, music, onChange, disabled }: Props) {
  useMusicVideoSync(videoRef, music)
  return (
    <section className={`space-y-2 ${disabled ? 'pointer-events-none opacity-60' : ''}`} data-testid="video-music-section">
      <h3 className="flex items-center gap-1.5 text-sm font-black text-black">
        <Music className="h-4 w-4" /> Background music
      </h3>
      <MusicSettings music={music} onChange={onChange} hasOriginalAudio />
      {music && <p className="text-[11px] text-zinc-500">Press play on the video to hear the mix. The song loops and fades out at the end.</p>}
    </section>
  )
}
