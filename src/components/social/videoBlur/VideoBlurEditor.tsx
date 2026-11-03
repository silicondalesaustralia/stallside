'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Plus } from 'lucide-react'
import { BlurRegionBox } from '@/components/social/videoBlur/BlurRegionBox'
import { BlurRegionList } from '@/components/social/videoBlur/BlurRegionList'
import { BlurTimeline } from '@/components/social/videoBlur/BlurTimeline'
import {
  useVideoPlayback,
  type VideoDimensions,
} from '@/components/social/videoBlur/useVideoPlayback'
import {
  VIDEO_BLUR_MAX_REGIONS,
  createBlurRegion,
  formatBlurTime,
  isBlurActiveAt,
} from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

export function VideoBlurEditor({
  videoUrl,
  regions,
  disabled,
  onChange,
  onDimensions,
}: {
  videoUrl: string
  regions: VideoBlurRegion[]
  disabled?: boolean
  onChange: (next: VideoBlurRegion[]) => void
  onDimensions?: (dims: VideoDimensions) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const {
    videoRef,
    dimensions,
    duration,
    currentTime,
    playing,
    loadError,
    seek,
    togglePlay,
    handlers,
  } = useVideoPlayback()
  const ratio = dimensions ? dimensions.width / dimensions.height : 16 / 9

  useEffect(() => {
    if (dimensions) onDimensions?.(dimensions)
  }, [dimensions, onDimensions])

  function updateRegion(next: VideoBlurRegion) {
    onChange(regions.map((r) => (r.id === next.id ? next : r)))
  }

  function addRegion() {
    const region = createBlurRegion(currentTime, duration)
    onChange([...regions, region])
    setSelectedId(region.id)
  }

  function removeRegion(id: string) {
    onChange(regions.filter((r) => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="space-y-2" data-testid="video-blur-editor">
      <div>
        <p className="text-xs font-semibold text-[#444]">Blur areas</p>
        <p className="text-[10px] leading-relaxed text-[#AAA]">
          Scrub to the moment, add a blur box, drag it over what you want hidden and resize it from
          the corner. Set when it starts and stops below.
        </p>
      </div>

      <div
        ref={containerRef}
        onPointerDown={() => setSelectedId(null)}
        className="relative mx-auto overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: `${ratio}`, width: `min(100%, calc(60vh * ${ratio}))` }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          preload="metadata"
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
          {...handlers}
        />
        {regions.map((region, index) => (
          <BlurRegionBox
            key={region.id}
            region={region}
            index={index}
            selected={region.id === selectedId}
            active={isBlurActiveAt(region, currentTime)}
            disabled={disabled}
            containerRef={containerRef}
            onSelect={() => setSelectedId(region.id)}
            onChange={updateRegion}
          />
        ))}
      </div>

      {loadError ? (
        <p className="text-xs font-medium text-red-600">
          We couldn&apos;t load this video for editing. Try refreshing the page.
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          disabled={duration <= 0}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:opacity-40"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <span className="text-[11px] tabular-nums text-[#666]">
          {formatBlurTime(currentTime)} / {formatBlurTime(duration)}
        </span>
        <button
          type="button"
          onClick={addRegion}
          disabled={disabled || duration <= 0 || regions.length >= VIDEO_BLUR_MAX_REGIONS}
          className="ml-auto inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#E0DDD5] bg-white px-2.5 text-[11px] font-semibold text-[#333] disabled:opacity-50"
          data-testid="video-blur-add"
        >
          <Plus className="h-3.5 w-3.5" />
          Add blur
        </button>
      </div>

      <BlurTimeline
        regions={regions}
        selectedId={selectedId}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        onSelect={setSelectedId}
      />

      <BlurRegionList
        regions={regions}
        selectedId={selectedId}
        currentTime={currentTime}
        duration={duration}
        disabled={disabled}
        onSelect={setSelectedId}
        onChange={updateRegion}
        onRemove={removeRegion}
      />
    </div>
  )
}
