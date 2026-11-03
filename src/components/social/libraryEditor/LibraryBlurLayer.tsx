'use client'

import { useRef } from 'react'
import { BlurRegionBox } from '@/components/social/videoBlur/BlurRegionBox'
import { isBlurActiveAt } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

type Props = {
  regions: VideoBlurRegion[]
  selectedId: string | null
  time: number
  disabled?: boolean
  onSelect: (id: string) => void
  onChange: (next: VideoBlurRegion) => void
}

/** Blur boxes drawn over the editor preview; boxes use 0-1 coordinates of the picture. */
export function LibraryBlurLayer({ regions, selectedId, time, disabled, onSelect, onChange }: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {regions.map((region, index) => (
        <BlurRegionBox
          key={region.id}
          region={region}
          index={index}
          selected={region.id === selectedId}
          active={isBlurActiveAt(region, time)}
          disabled={disabled}
          containerRef={layerRef}
          onSelect={() => onSelect(region.id)}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
