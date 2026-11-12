'use client'

import { Check, Loader2, Pause, Play } from 'lucide-react'
import { formatTrackLength } from '@/lib/social/music/musicCatalog'
import type { MusicTrack } from '@/lib/social/music/musicTypes'

type Props = {
  track: MusicTrack
  playing: boolean
  loading: boolean
  selected: boolean
  onToggle: () => void
  onUse: () => void
}

export function MusicTrackRow({ track, playing, loading, selected, onToggle, onUse }: Props) {
  return (
    <li className={`flex items-center gap-3 rounded-xl px-2 py-2 ${selected ? 'bg-[#FFF8DB]' : 'hover:bg-zinc-50'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#18181B] text-white"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#18181B]">{track.title}</p>
        <p className="truncate text-[11px] text-zinc-500">
          {track.artist} · {formatTrackLength(track.durationSeconds)}
          {track.description ? ` · ${track.description}` : ''}
        </p>
      </div>
      <button
        type="button"
        onClick={onUse}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
          selected ? 'bg-[#18181B] text-white' : 'border border-[#E4E4E7] bg-white text-zinc-700 hover:border-[#F5C518]'
        }`}
      >
        {selected ? (
          <span className="inline-flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Chosen
          </span>
        ) : (
          'Use'
        )}
      </button>
    </li>
  )
}
