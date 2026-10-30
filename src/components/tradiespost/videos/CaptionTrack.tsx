'use client'

import { useRef, type PointerEvent } from 'react'
import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import { dragCue, type CueDragMode } from '@/lib/social/videoClips/timelineEdits'

type Props = {
  cues: CaptionCue[]
  duration: number
  activeIndex: number
  disabled?: boolean
  onChange: (next: CaptionCue[]) => void
  onSeek: (seconds: number) => void
}

type Drag = { index: number; mode: CueDragMode; startX: number; secPerPx: number; base: CaptionCue[]; moved: boolean }

/** Caption blocks: drag to move, drag the edges to change start/end. */
export function CaptionTrack({ cues, duration, activeIndex, disabled, onChange, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const pct = (t: number) => `${(t / duration) * 100}%`

  function start(e: PointerEvent<HTMLElement>, index: number, mode: CueDragMode) {
    e.stopPropagation()
    const width = trackRef.current?.clientWidth ?? 0
    if (disabled || width <= 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { index, mode, startX: e.clientX, secPerPx: duration / width, base: cues, moved: false }
  }

  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) < 3) return
    d.moved = true
    onChange(dragCue(d.base, d.index, d.mode, dx * d.secPerPx, duration))
  }

  function end() {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) onSeek(d.base[d.index].s)
  }

  return (
    <div ref={trackRef} className="relative h-10 rounded-lg bg-zinc-100">
      {cues.map((cue, i) => (
        <div
          key={i}
          title={cue.text}
          onPointerDown={(e) => start(e, i, 'move')}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          style={{ left: pct(cue.s), width: pct(cue.e - cue.s) }}
          className={`absolute inset-y-1 flex touch-none select-none items-center overflow-hidden rounded-md border text-[10px] font-semibold text-black ${
            i === activeIndex ? 'border-black bg-tradiespost-gold' : 'border-amber-300 bg-amber-100'
          } ${disabled ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
        >
          <span
            onPointerDown={(e) => start(e, i, 'start')}
            className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize bg-black/20"
            aria-hidden
          />
          <span className="truncate px-2">{cue.text}</span>
          <span
            onPointerDown={(e) => start(e, i, 'end')}
            className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize bg-black/20"
            aria-hidden
          />
        </div>
      ))}
    </div>
  )
}
