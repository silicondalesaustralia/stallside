'use client'

import { useRef, type PointerEvent } from 'react'
import { dragOverlayTime, type TextOverlay } from '@/lib/social/videoClips/textOverlays'

type Mode = 'move' | 'start' | 'end'

type Props = {
  overlays: TextOverlay[]
  duration: number
  selectedId: string | null
  disabled?: boolean
  onChange: (next: TextOverlay[]) => void
  onSelect: (id: string, seekTo: number) => void
}

type Drag = { id: string; mode: Mode; startX: number; secPerPx: number; base: TextOverlay; moved: boolean }

/** Text overlay blocks: drag to move in time, drag the edges to change when they appear/disappear. */
export function OverlayTrack({ overlays, duration, selectedId, disabled, onChange, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const pct = (t: number) => `${(t / duration) * 100}%`

  function start(e: PointerEvent<HTMLElement>, overlay: TextOverlay, mode: Mode) {
    e.stopPropagation()
    const width = trackRef.current?.clientWidth ?? 0
    if (width <= 0) return
    if (disabled) {
      onSelect(overlay.id, overlay.s)
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: overlay.id, mode, startX: e.clientX, secPerPx: duration / width, base: overlay, moved: false }
  }

  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) < 3) return
    d.moved = true
    const next = dragOverlayTime(d.base, d.mode, dx * d.secPerPx, duration)
    onChange(overlays.map((o) => (o.id === d.id ? next : o)))
  }

  function end() {
    const d = drag.current
    drag.current = null
    if (d) onSelect(d.id, d.moved ? (overlays.find((o) => o.id === d.id)?.s ?? d.base.s) : d.base.s)
  }

  return (
    <div ref={trackRef} className="relative h-8 rounded-lg bg-sky-50">
      {overlays.length === 0 ? (
        <span className="pointer-events-none absolute inset-0 flex items-center px-2 text-[10px] text-zinc-400">
          Text overlays appear here — use “Add text”
        </span>
      ) : null}
      {overlays.map((o) => (
        <div
          key={o.id}
          title={o.text}
          onPointerDown={(e) => start(e, o, 'move')}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          style={{ left: pct(o.s), width: pct(o.e - o.s), zIndex: o.id === selectedId ? 2 : 1 }}
          className={`absolute inset-y-1 flex touch-none select-none items-center overflow-hidden rounded-md border text-[10px] font-semibold ${
            o.id === selectedId ? 'border-black bg-sky-400 text-white' : 'border-sky-300 bg-sky-100 text-sky-900'
          } ${disabled ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
        >
          <span onPointerDown={(e) => start(e, o, 'start')} className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize bg-black/20" aria-hidden />
          <span className="truncate px-2">{o.text}</span>
          <span onPointerDown={(e) => start(e, o, 'end')} className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize bg-black/20" aria-hidden />
        </div>
      ))}
    </div>
  )
}
