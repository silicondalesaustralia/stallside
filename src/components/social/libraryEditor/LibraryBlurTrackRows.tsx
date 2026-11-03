'use client'

import { BlurTrackRow } from '@/components/social/videoBlur/BlurTrackRow'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

type Props = {
  regions: VideoBlurRegion[]
  selectedId: string | null
  duration: number
  disabled?: boolean
  onSelect: (id: string, seekTo: number) => void
  onChange: (next: VideoBlurRegion) => void
  onRemove: (id: string) => void
}

/** One timeline row per blur area, under the clip editor's tracks. */
export function LibraryBlurTrackRows({ regions, selectedId, duration, disabled, onSelect, onChange, onRemove }: Props) {
  return (
    <>
      {regions.map((region, index) => (
        <BlurTrackRow
          key={region.id}
          region={region}
          index={index}
          duration={duration}
          selected={region.id === selectedId}
          disabled={disabled}
          onChange={onChange}
          onSelect={(seekTo) => onSelect(region.id, seekTo)}
          onRemove={() => onRemove(region.id)}
        />
      ))}
    </>
  )
}
