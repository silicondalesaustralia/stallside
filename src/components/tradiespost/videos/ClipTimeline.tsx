'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { AudioPart } from '@/lib/social/videoClips/audioEdits'
import type { CaptionCue } from '@/lib/social/videoClips/captionCues'
import type { ClipSegment } from '@/lib/social/videoClips/timeline'
import type { TextOverlay } from '@/lib/social/videoClips/textOverlays'
import { AudioTrack } from './AudioTrack'
import { CaptionTrack } from './CaptionTrack'
import { OverlayTrack } from './OverlayTrack'
import { TimelineRuler } from './TimelineRuler'
import { TimelineTransport } from './TimelineTransport'

type Props = {
  duration: number
  time: number
  playing: boolean
  segments: ClipSegment[]
  cues: CaptionCue[]
  activeIndex: number
  disabled?: boolean
  onSeek: (seconds: number) => void
  onTogglePlay: () => void
  onCues: (next: CaptionCue[]) => void
  audioParts: AudioPart[]
  onAudioParts: (next: AudioPart[]) => void
  overlays: TextOverlay[]
  selectedOverlayId: string | null
  onOverlays: (next: TextOverlay[]) => void
  onSelectOverlay: (id: string) => void
}

const PX_PER_SECOND = 24

/** Ruler + video, voice, caption and text tracks with a shared playhead. Click or drag to scrub. */
export function ClipTimeline(props: Props) {
  const { duration, time, playing, segments, cues, activeIndex, disabled, onSeek, onCues } = props
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrubbing = useRef(false)
  const [zoom, setZoom] = useState(1)

  function playheadX(): { scroller: HTMLDivElement; x: number } | null {
    const scroller = scrollRef.current
    const content = contentRef.current
    if (!scroller || !content || duration <= 0) return null
    return { scroller, x: (time / duration) * content.scrollWidth }
  }

  useEffect(() => {
    const p = playing ? playheadX() : null
    if (!p) return
    const view = p.scroller.clientWidth
    if (p.x < p.scroller.scrollLeft + 16 || p.x > p.scroller.scrollLeft + view - 16) p.scroller.scrollLeft = p.x - view * 0.3
  })

  useEffect(() => {
    const p = playheadX()
    if (p) p.scroller.scrollLeft = p.x - p.scroller.clientWidth / 2
  }, [zoom])

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
    <div className="space-y-2 rounded-xl border border-tradiespost-border bg-white p-2">
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
          <div className="relative h-8 rounded-lg bg-[repeating-linear-gradient(45deg,#e4e4e7_0_6px,#f4f4f5_6px_12px)]">
            {segments.map((seg, i) => (
              <div
                key={`${seg.s}-${i}`}
                className="absolute inset-y-0 rounded-md border-x-2 border-white bg-zinc-800"
                style={{ left: pct(seg.s), width: pct(seg.e - seg.s) }}
              />
            ))}
          </div>
          <AudioTrack parts={props.audioParts} duration={duration} disabled={disabled} onChange={props.onAudioParts} />
          <CaptionTrack cues={cues} duration={duration} activeIndex={activeIndex} disabled={disabled} onChange={onCues} onSeek={onSeek} />
          <OverlayTrack
            overlays={props.overlays}
            duration={duration}
            selectedId={props.selectedOverlayId}
            disabled={disabled}
            onChange={props.onOverlays}
            onSelect={(id, seekTo) => {
              props.onSelectOverlay(id)
              onSeek(seekTo)
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-red-500" style={{ left: pct(time) }}>
            <span className="absolute -top-0.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}
