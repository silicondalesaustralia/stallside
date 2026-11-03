'use client'

import { Pause, Play, ZoomIn, ZoomOut } from 'lucide-react'
import { timelineZoomLevels } from '@/lib/social/videoClips/timelineZoom'

type Props = {
  time: number
  duration: number
  playing: boolean
  zoom: number
  onTogglePlay: () => void
  onZoom: (zoom: number) => void
}

function timecode(seconds: number): string {
  const t = Math.max(0, seconds)
  return `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`
}

/** Play/pause, current time and zoom for the timeline. */
export function TimelineTransport({ time, duration, playing, zoom, onTogglePlay, onZoom }: Props) {
  const levels = timelineZoomLevels(duration)
  const level = levels.indexOf(zoom)
  const iconBtn = 'rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" aria-hidden />}
      </button>
      <span className="font-mono text-xs tabular-nums text-zinc-600">
        {timecode(time)} / {timecode(duration)}
      </span>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" onClick={() => onZoom(levels[level - 1])} disabled={level <= 0} className={iconBtn} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" aria-hidden />
        </button>
        <input
          type="range"
          min={0}
          max={levels.length - 1}
          value={Math.max(0, level)}
          onChange={(e) => onZoom(levels[Number(e.target.value)])}
          className="w-20 accent-black sm:w-28"
          aria-label="Timeline zoom"
        />
        <button
          type="button"
          onClick={() => onZoom(levels[level + 1])}
          disabled={level >= levels.length - 1}
          className={iconBtn}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
