'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { BlurTrackRow } from '@/components/social/videoBlur/BlurTrackRow'
import { TimelineRuler } from '@/components/tradiespost/videos/TimelineRuler'
import { TimelineTransport } from '@/components/tradiespost/videos/TimelineTransport'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

const PX_PER_SECOND = 24

type Props = {
  regions: VideoBlurRegion[]
  selectedId: string | null
  time: number
  duration: number
  playing: boolean
  disabled?: boolean
  onSeek: (time: number) => void
  onTogglePlay: () => void
  onSelect: (id: string) => void
  onChange: (next: VideoBlurRegion) => void
  onRemove: (id: string) => void
}

/** Ruler + one row per blur with a shared playhead. Click or drag the ruler to scrub. */
export function BlurTimeline(props: Props) {
  const { regions, selectedId, time, duration, playing, disabled, onSeek } = props
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrubbing = useRef(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const scroller = scrollRef.current
    const content = contentRef.current
    if (!playing || !scroller || !content || duration <= 0) return
    const x = (time / duration) * content.scrollWidth
    const view = scroller.clientWidth
    if (x < scroller.scrollLeft + 16 || x > scroller.scrollLeft + view - 16) scroller.scrollLeft = x - view * 0.3
  }, [playing, time, duration])

  const timeRef = useRef(time)
  useEffect(() => {
    timeRef.current = time
  }, [time])

  useEffect(() => {
    const scroller = scrollRef.current
    const content = contentRef.current
    if (!scroller || !content || duration <= 0) return
    scroller.scrollLeft = (timeRef.current / duration) * content.scrollWidth - scroller.clientWidth / 2
  }, [zoom, duration])

  if (duration <= 0) return null
  const pct = (t: number) => `${(Math.min(Math.max(t, 0), duration) / duration) * 100}%`

  function seekFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = contentRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return
    onSeek(Math.min(Math.max(((e.clientX - rect.left) / rect.width) * duration, 0), duration))
  }

  function startScrub(e: PointerEvent<HTMLDivElement>) {
    scrubbing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    seekFromPointer(e)
  }

  const endScrub = () => {
    scrubbing.current = false
  }

  return (
    <div className="space-y-2 rounded-xl border border-[#EDEAE2] bg-white p-2" data-testid="video-blur-timeline">
      <TimelineTransport time={time} duration={duration} playing={playing} zoom={zoom} onTogglePlay={props.onTogglePlay} onZoom={setZoom} />
      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div
          ref={contentRef}
          onPointerDown={startScrub}
          onPointerMove={(e) => scrubbing.current && seekFromPointer(e)}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
          className="relative cursor-pointer touch-none space-y-1.5 select-none"
          style={{ width: `calc(max(100%, ${Math.ceil(duration * PX_PER_SECOND)}px) * ${zoom})` }}
        >
          <TimelineRuler duration={duration} zoom={zoom} />
          {regions.length === 0 ? (
            <div className="flex h-8 items-center rounded-lg bg-indigo-50 px-2 text-[10px] text-zinc-400">
              Blurs appear here as rows — use “Add blur”
            </div>
          ) : null}
          {regions.map((region, index) => (
            <BlurTrackRow
              key={region.id}
              region={region}
              index={index}
              duration={duration}
              selected={region.id === selectedId}
              disabled={disabled}
              onChange={props.onChange}
              onSelect={(seekTo) => {
                props.onSelect(region.id)
                onSeek(seekTo)
              }}
              onRemove={() => props.onRemove(region.id)}
            />
          ))}
          <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-red-500" style={{ left: pct(time) }}>
            <span className="absolute -top-0.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}
