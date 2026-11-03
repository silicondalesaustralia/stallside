'use client'

import { useRef, type PointerEvent, type RefObject } from 'react'
import { clampBlurGeometry } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

type DragState = {
  mode: 'move' | 'resize'
  startX: number
  startY: number
  origin: VideoBlurRegion
}

export function BlurRegionBox({
  region,
  index,
  selected,
  active,
  disabled,
  containerRef,
  onSelect,
  onChange,
}: {
  region: VideoBlurRegion
  index: number
  selected: boolean
  active: boolean
  disabled?: boolean
  containerRef: RefObject<HTMLDivElement | null>
  onSelect: () => void
  onChange: (next: VideoBlurRegion) => void
}) {
  const drag = useRef<DragState | null>(null)

  function begin(mode: DragState['mode'], e: PointerEvent<HTMLElement>) {
    e.stopPropagation()
    onSelect()
    if (disabled) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { mode, startX: e.clientX, startY: e.clientY, origin: region }
  }

  function move(e: PointerEvent<HTMLElement>) {
    const state = drag.current
    const rect = containerRef.current?.getBoundingClientRect()
    if (!state || !rect || rect.width <= 0 || rect.height <= 0) return
    const dx = (e.clientX - state.startX) / rect.width
    const dy = (e.clientY - state.startY) / rect.height
    const { origin } = state
    const next =
      state.mode === 'move'
        ? { ...origin, x: origin.x + dx, y: origin.y + dy }
        : {
            ...origin,
            width: Math.min(origin.width + dx, 1 - origin.x),
            height: Math.min(origin.height + dy, 1 - origin.y),
          }
    onChange(clampBlurGeometry(next))
  }

  function end() {
    drag.current = null
  }

  const visual = active
    ? 'border-white/90 bg-white/10 [backdrop-filter:blur(10px)]'
    : 'border-dashed border-white/70 bg-black/10'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Blur area ${index + 1}`}
      onPointerDown={(e) => begin('move', e)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect()
      }}
      className={`pointer-events-auto absolute touch-none select-none border-2 ${visual} ${
        selected ? 'ring-2 ring-[#FFD700]' : ''
      } ${disabled ? 'cursor-default' : 'cursor-move'}`}
      style={{
        left: `${region.x * 100}%`,
        top: `${region.y * 100}%`,
        width: `${region.width * 100}%`,
        height: `${region.height * 100}%`,
      }}
      data-testid={`video-blur-box-${index}`}
    >
      <span className="pointer-events-none absolute left-0.5 top-0.5 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
        {index + 1}
      </span>
      {selected && !disabled ? (
        <span
          onPointerDown={(e) => begin('resize', e)}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize touch-none rounded-full border-2 border-white bg-[#FFD700] shadow"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
