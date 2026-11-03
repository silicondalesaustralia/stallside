'use client'

import { useRef, type PointerEvent } from 'react'
import { X } from 'lucide-react'
import { dragBlurTime, formatBlurTime } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

type Mode = 'move' | 'start' | 'end'
type Drag = { mode: Mode; startX: number; secPerPx: number; base: VideoBlurRegion; moved: boolean }

type Props = {
  region: VideoBlurRegion
  index: number
  duration: number
  selected: boolean
  disabled?: boolean
  onChange: (next: VideoBlurRegion) => void
  onSelect: (seekTo: number) => void
  onRemove: () => void
}

/** One blur's track: drag the bar to move it in time, drag its edges to set when it starts and stops. */
export function BlurTrackRow({ region, index, duration, selected, disabled, onChange, onSelect, onRemove }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const pct = (t: number) => `${(t / duration) * 100}%`

  function start(e: PointerEvent<HTMLElement>, mode: Mode) {
    e.stopPropagation()
    const width = trackRef.current?.clientWidth ?? 0
    if (width <= 0) return
    if (disabled) {
      onSelect(region.start)
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { mode, startX: e.clientX, secPerPx: duration / width, base: region, moved: false }
  }

  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) < 3) return
    d.moved = true
    onChange(dragBlurTime(d.base, d.mode, dx * d.secPerPx, duration))
  }

  function end() {
    const d = drag.current
    drag.current = null
    if (!d) return
    onSelect(d.mode === 'end' && d.moved ? region.end : region.start)
  }

  const label = `Blur ${index + 1} · ${formatBlurTime(region.start)} - ${formatBlurTime(region.end)}`

  return (
    <div ref={trackRef} className="relative h-8 rounded-lg bg-indigo-50" data-testid={`video-blur-track-${index}`}>
      <div
        title={label}
        onPointerDown={(e) => start(e, 'move')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{ left: pct(region.start), width: pct(region.end - region.start), zIndex: selected ? 2 : 1 }}
        className={`absolute inset-y-1 flex min-w-[12px] touch-none select-none items-center overflow-hidden rounded-md border text-[10px] font-semibold ${
          selected ? 'border-black bg-indigo-500 text-white' : 'border-indigo-300 bg-indigo-200 text-indigo-900'
        } ${disabled ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <span onPointerDown={(e) => start(e, 'start')} className="absolute inset-y-0 left-0 w-2 cursor-ew-resize bg-black/20" aria-hidden />
        <span className="truncate px-2.5">Blur {index + 1}</span>
        {selected && !disabled ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            aria-label={`Remove blur ${index + 1}`}
            className="ml-auto mr-2.5 shrink-0 rounded p-0.5 hover:bg-white/25"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
        <span onPointerDown={(e) => start(e, 'end')} className="absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-black/20" aria-hidden />
      </div>
    </div>
  )
}
