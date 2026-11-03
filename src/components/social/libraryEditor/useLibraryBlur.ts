'use client'

import { useState } from 'react'
import { VIDEO_BLUR_MAX_REGIONS, createBlurRegion } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

/** Blur areas for the Library editor. Times are seconds of the original upload. */
export function useLibraryBlur(initial: VideoBlurRegion[]) {
  const [regions, setRegions] = useState<VideoBlurRegion[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function add(time: number, duration: number) {
    if (regions.length >= VIDEO_BLUR_MAX_REGIONS || duration <= 0) return
    const region = createBlurRegion(time, duration)
    setRegions([...regions, region])
    setSelectedId(region.id)
  }

  function update(next: VideoBlurRegion) {
    setRegions((list) => list.map((r) => (r.id === next.id ? next : r)))
  }

  function remove(id: string) {
    setRegions((list) => list.filter((r) => r.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }

  return { regions, selectedId, setSelectedId, add, update, remove, canAdd: regions.length < VIDEO_BLUR_MAX_REGIONS }
}
