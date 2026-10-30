'use client'

import { useRef, type CSSProperties, type PointerEvent } from 'react'
import type { TextOverlay } from '@/lib/social/videoClips/textOverlays'
import { videoFontCss } from './videoFontCss'

type Props = {
  overlays: TextOverlay[]
  time: number
  selectedId: string | null
  disabled?: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
}

export function overlayCss(o: TextOverlay): CSSProperties {
  const base: CSSProperties = {
    fontFamily: videoFontCss(o.font),
    fontSize: `${o.size}cqmin`,
    fontWeight: o.bold ? 700 : 400,
    color: o.color,
    lineHeight: 1.1,
  }
  if (o.style === 'box') return { ...base, background: o.accent, padding: `${o.size * 0.25}cqmin` }
  if (o.style === 'outline') {
    return { ...base, WebkitTextStroke: `${Math.max(0.3, o.size * 0.08)}cqmin ${o.accent}`, paintOrder: 'stroke fill' }
  }
  return { ...base, textShadow: '0 0.4cqmin 0.6cqmin rgba(0,0,0,0.85)' }
}

/** Overlays visible at the playhead, matching the render; drag to position. */
export function OverlayPreviewLayer({ overlays, time, selectedId, disabled, onSelect, onMove }: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const draggingId = useRef<string | null>(null)

  function move(e: PointerEvent<HTMLDivElement>) {
    const rect = layerRef.current?.getBoundingClientRect()
    const id = draggingId.current
    if (!rect || !id || rect.width <= 0 || rect.height <= 0) return
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1)
    onMove(id, Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000)
  }

  const visible = overlays.filter((o) => time >= o.s && time < o.e)

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {visible.map((o) => (
        <div
          key={o.id}
          onPointerDown={(e) => {
            onSelect(o.id)
            if (disabled) return
            e.currentTarget.setPointerCapture(e.pointerId)
            draggingId.current = o.id
          }}
          onPointerMove={move}
          onPointerUp={() => (draggingId.current = null)}
          onPointerCancel={() => (draggingId.current = null)}
          className={`pointer-events-auto absolute max-w-[90%] -translate-x-1/2 -translate-y-1/2 touch-none select-none whitespace-pre-wrap text-center ${
            o.id === selectedId ? 'cursor-move outline-dashed outline-2 outline-offset-2 outline-tradiespost-gold' : 'cursor-pointer'
          }`}
          style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, ...overlayCss(o) }}
        >
          {o.text}
        </div>
      ))}
    </div>
  )
}
