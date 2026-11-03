'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { VideoDimensions } from '@/components/social/videoBlur/useVideoPlayback'

/** Natural size of a <video> once its metadata loads. Re-attaches when `src` changes. */
export function useVideoElementDimensions(ref: RefObject<HTMLVideoElement | null>, src: string | null) {
  const [dims, setDims] = useState<VideoDimensions | null>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const read = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setDims({ width: video.videoWidth, height: video.videoHeight })
      }
    }
    read()
    video.addEventListener('loadedmetadata', read)
    return () => video.removeEventListener('loadedmetadata', read)
  }, [ref, src])

  return dims
}
