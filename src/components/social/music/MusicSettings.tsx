'use client'

import { useState } from 'react'
import { Music, X } from 'lucide-react'
import { MusicPicker } from '@/components/social/music/MusicPicker'
import { MusicVolumeSlider } from '@/components/social/music/MusicVolumeSlider'
import { findMusicTrack, formatTrackLength } from '@/lib/social/music/musicCatalog'
import {
  DEFAULT_MUSIC_ONLY_VOLUME,
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_ORIGINAL_VOLUME,
  type MusicChoice,
} from '@/lib/social/music/musicTypes'

type Props = {
  music: MusicChoice | null
  onChange: (music: MusicChoice | null) => void
  /** False for slideshows and silent clips: hides the "video sound" slider and starts music louder. */
  hasOriginalAudio: boolean
}

/** Pick a background song and set how loud it sits against the video's own sound. */
export function MusicSettings({ music, onChange, hasOriginalAudio }: Props) {
  const track = findMusicTrack(music?.trackId)
  const [browsing, setBrowsing] = useState(false)

  return (
    <div className="space-y-3" data-testid="music-settings">
      {track && music ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2">
          <Music className="h-4 w-4 shrink-0 text-zinc-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#18181B]">{track.title}</p>
            <p className="truncate text-[11px] text-zinc-500">
              {track.artist} · {formatTrackLength(track.durationSeconds)} · loops to fit the video
            </p>
          </div>
          <button type="button" onClick={() => setBrowsing((b) => !b)} className="text-xs font-bold text-zinc-700 hover:underline">
            {browsing ? 'Done' : 'Change'}
          </button>
          <button type="button" onClick={() => onChange(null)} aria-label="Remove music" className="text-zinc-500 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">Add a background song. Tap play to listen, then Use.</p>
      )}

      {music && (
        <div className="grid gap-3 sm:grid-cols-2">
          <MusicVolumeSlider label="Music volume" value={music.volume} onChange={(volume) => onChange({ ...music, volume })} />
          {hasOriginalAudio && (
            <MusicVolumeSlider
              label="Video's own sound"
              value={music.originalVolume}
              onChange={(originalVolume) => onChange({ ...music, originalVolume })}
            />
          )}
        </div>
      )}

      {(!music || browsing) && (
        <MusicPicker
          selectedId={music?.trackId ?? null}
          onUse={(picked) => {
            onChange({
              trackId: picked.id,
              volume: music?.volume ?? (hasOriginalAudio ? DEFAULT_MUSIC_VOLUME : DEFAULT_MUSIC_ONLY_VOLUME),
              originalVolume: music?.originalVolume ?? DEFAULT_ORIGINAL_VOLUME,
            })
            setBrowsing(false)
          }}
        />
      )}
    </div>
  )
}
