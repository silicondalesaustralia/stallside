'use client'

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { overlayPosition, overlaySizeFromDrag, overlayWidthFromPointer } from '@/lib/social/videoClips/overlayLayout'
import type { TextOverlay } from '@/lib/social/videoClips/textOverlays'
import { OverlaySnapGrid } from './OverlaySnapGrid'
import { videoFontCss } from './videoFontCss'

export type OverlayLayoutPatch = Partial<Pick<TextOverlay, 'x' | 'y' | 'width' | 'size'>>

type Props = {
  overlays: TextOverlay[]
  time: number
  selectedId: string | null
  disabled?: boolean
  /** Snap position and width to the grid while dragging. */
  snap: boolean
  onSelect: (id: string) => void
  onChange: (id: string, patch: OverlayLayoutPatch) => void
}

type Mode = 'move' | 'width' | 'size'
type Drag = { id: string; mode: Mode; overlay: TextOverlay; startDistance: number }

export function overlayCss(o: TextOverlay): CSSProperties {
  const base: CSSProperties = {
    fontFamily: videoFontCss(o.font),
    fontSize: `${o.size}cqmin`,
    fontWeight: o.bold ? 700 : 400,
    color: o.color,
    lineHeight: 1.1,
  }
  if (o.style === 'box') return { ...base, background: o.accent, padding: `${o.size * 0.25}cqmin`, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }
  if (o.style === 'outline') {
    return { ...base, WebkitTextStroke: `${Math.max(0.3, o.size * 0.08)}cqmin ${o.accent}`, paintOrder: 'stroke fill' }
  }
  return { ...base, textShadow: '0 0.4cqmin 0.6cqmin rgba(0,0,0,0.85)' }
}

const HANDLE = 'pointer-events-auto absolute h-3.5 w-3.5 touch-none rounded-full border-2 border-white bg-tradiespost-gold shadow'

/** Overlays visible at the playhead, matching the render. Drag to move; drag the handles to set width and size. */
export function OverlayPreviewLayer({ overlays, time, selectedId, disabled, snap, onSelect, onChange }: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const [dragging, setDragging] = useState(false)

  function pointer(e: PointerEvent<HTMLElement>) {
    const rect = layerRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return null
    return { rect, x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
  }

  function start(e: PointerEvent<HTMLElement>, o: TextOverlay, mode: Mode) {
    e.stopPropagation()
    onSelect(o.id)
    const p = pointer(e)
    if (disabled || !p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const startDistance = Math.hypot((p.x - o.x) * p.rect.width, (p.y - o.y) * p.rect.height)
    drag.current = { id: o.id, mode, overlay: o, startDistance }
    setDragging(true)
  }

  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current
    const p = d ? pointer(e) : null
    if (!d || !p) return
    const o = d.overlay
    if (d.mode === 'move') onChange(d.id, { x: overlayPosition(p.x, snap), y: overlayPosition(p.y, snap) })
    else if (d.mode === 'width') onChange(d.id, { width: overlayWidthFromPointer(p.x, o.x, snap) })
    else {
      const distance = Math.hypot((p.x - o.x) * p.rect.width, (p.y - o.y) * p.rect.height)
      onChange(d.id, { size: overlaySizeFromDrag(o.size, d.startDistance, distance) })
    }
  }

  function end() {
    drag.current = null
    setDragging(false)
  }

  const visible = overlays.filter((o) => time >= o.s && time < o.e)

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {dragging && snap ? <OverlaySnapGrid /> : null}
      {visible.map((o) => {
        const selected = o.id === selectedId
        return (
          <div
            key={o.id}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className={`absolute -translate-x-1/2 -translate-y-1/2 select-none whitespace-pre-wrap text-center ${
              selected ? 'outline-dashed outline-2 outline-offset-2 outline-tradiespost-gold' : ''
            }`}
            style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, width: `${o.width}%` }}
          >
            <span
              onPointerDown={(e) => start(e, o, 'move')}
              className={`pointer-events-auto touch-none ${selected ? 'cursor-move' : 'cursor-pointer'}`}
              style={overlayCss(o)}
            >
              {o.text}
            </span>
            {selected && !disabled ? (
              <>
                <span onPointerDown={(e) => start(e, o, 'width')} className={`${HANDLE} -right-2 top-1/2 -translate-y-1/2 cursor-ew-resize`} aria-label="Drag to change text width" />
                <span onPointerDown={(e) => start(e, o, 'size')} className={`${HANDLE} -bottom-2 -right-2 cursor-nwse-resize`} aria-label="Drag to resize text" />
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
