'use client'

import { Trash2 } from 'lucide-react'
import { MAX_CUE_CHARS, type CaptionCue } from '@/lib/social/videoClips/captionCues'

type Props = {
  cues: CaptionCue[]
  activeIndex: number
  disabled?: boolean
  onChange: (next: CaptionCue[]) => void
  onSeek: (seconds: number) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

export function CaptionCueList({ cues, activeIndex, disabled, onChange, onSeek }: Props) {
  if (!cues.length) {
    return <p className="text-sm text-zinc-500">No speech was found in this clip, so there are no captions to edit.</p>
  }

  return (
    <ul className="space-y-2">
      {cues.map((cue, i) => (
        <li
          key={`${cue.s}-${i}`}
          className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
            i === activeIndex ? 'border-tradiespost-gold bg-tradiespost-gold/10' : 'border-tradiespost-border'
          }`}
        >
          <button
            type="button"
            onClick={() => onSeek(cue.s)}
            className="shrink-0 rounded-lg px-1.5 py-1 font-mono text-[11px] text-zinc-500 hover:bg-zinc-100"
            aria-label={`Play from ${formatTime(cue.s)}`}
          >
            {formatTime(cue.s)}
          </button>
          <input
            className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-sm text-tradiespost-text focus:border-tradiespost-border focus:outline-none disabled:opacity-60"
            value={cue.text}
            maxLength={MAX_CUE_CHARS}
            disabled={disabled}
            onFocus={() => onSeek(cue.s)}
            onChange={(e) => onChange(cues.map((c, j) => (j === i ? { ...c, text: e.target.value } : c)))}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(cues.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 disabled:opacity-50"
            aria-label="Remove caption line"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )
}
