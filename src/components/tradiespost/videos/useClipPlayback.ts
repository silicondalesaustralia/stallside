'use client'

import { useCallback, useState, type RefObject } from 'react'
import { isAudioMutedAt, type AudioPart } from '@/lib/social/videoClips/audioEdits'
import { nextPlayableTime, type ClipSegment } from '@/lib/social/videoClips/timeline'

/** Preview playback that follows the edit: skips cuts, silences muted voice, stops at the end. */
export function useClipPlayback(videoRef: RefObject<HTMLVideoElement | null>, segments: ClipSegment[], audioParts: AudioPart[]) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)

  const seek = useCallback(
    (seconds: number) => {
      if (videoRef.current) videoRef.current.currentTime = seconds
      setTime(seconds)
    },
    [videoRef],
  )

  const onTime = useCallback(
    (seconds: number) => {
      setTime(seconds)
      const video = videoRef.current
      if (!video) return
      const muted = isAudioMutedAt(audioParts, seconds)
      if (video.muted !== muted) video.muted = muted
      if (video.paused || !segments.length) return
      const next = nextPlayableTime(seconds, segments)
      if (next == null) video.pause()
      else if (next - seconds > 0.05) video.currentTime = next
    },
    [segments, audioParts, videoRef],
  )

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (!video.paused) {
      video.pause()
      return
    }
    const start = nextPlayableTime(video.currentTime, segments) ?? segments[0]?.s ?? 0
    if (Math.abs(start - video.currentTime) > 0.05) video.currentTime = start
    video.play().catch((err: unknown) => console.warn('[ClipEditor] play failed', err))
  }, [segments, videoRef])

  return { time, seek, onTime, playing, setPlaying, togglePlay }
}
