'use client'

import { timelineTickStep } from '@/lib/social/videoClips/timelineZoom'

type Props = { duration: number; zoom: number }

function label(t: number): string {
  const whole = Math.floor(t)
  const sec = `${String(whole % 60).padStart(2, '0')}${t % 1 ? '.5' : ''}`
  return `${Math.floor(whole / 60)}:${sec}`
}

/** Time labels; tighter spacing as the timeline zooms in. */
export function TimelineRuler({ duration, zoom }: Props) {
  const step = timelineTickStep(duration / zoom)
  const ticks = Array.from({ length: Math.floor(duration / step) + 1 }, (_, i) => i * step)
  return (
    <div className="relative h-4 text-[10px] text-zinc-400">
      {ticks.map((t) => (
        <span key={t} className="absolute -translate-x-1/2 first:translate-x-0" style={{ left: `${(t / duration) * 100}%` }}>
          {label(t)}
        </span>
      ))}
    </div>
  )
}
