'use client'

import { Volume2, VolumeX } from 'lucide-react'
import type { AudioPart } from '@/lib/social/videoClips/audioEdits'

type Props = {
  parts: AudioPart[]
  duration: number
  disabled?: boolean
  onChange: (next: AudioPart[]) => void
}

/** Voice track: each piece can be muted on its own (split with “Split voice”). Click elsewhere to scrub. */
export function AudioTrack({ parts, duration, disabled, onChange }: Props) {
  const pct = (t: number) => `${(t / duration) * 100}%`

  return (
    <div className="relative h-8 rounded-lg bg-emerald-50">
      {parts.map((p, i) => (
        <div
          key={`${p.s}-${i}`}
          style={{ left: pct(p.s), width: pct(p.e - p.s) }}
          className={`absolute inset-y-1 flex items-center overflow-hidden rounded-md border px-1 text-[10px] font-semibold ${
            p.muted
              ? 'border-zinc-300 bg-[repeating-linear-gradient(45deg,#e4e4e7_0_6px,#f4f4f5_6px_12px)] text-zinc-500'
              : 'border-emerald-300 bg-emerald-200 text-emerald-900'
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onChange(parts.map((q, j) => (j === i ? { ...q, muted: !q.muted } : q)))}
            className="flex shrink-0 items-center rounded p-0.5 hover:bg-black/10 disabled:opacity-50"
            aria-label={p.muted ? 'Unmute this voice section' : 'Mute this voice section'}
            title={p.muted ? 'Unmute' : 'Mute'}
          >
            {p.muted ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
          </button>
          <span className="pointer-events-none truncate px-1">{p.muted ? 'Muted' : 'Voice'}</span>
        </div>
      ))}
    </div>
  )
}
