'use client'

import { useCallback, useRef, useState, type SyntheticEvent } from 'react'

export type VideoDimensions = { width: number; height: number }

export function useVideoPlayback() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dimensions, setDimensions] = useState<VideoDimensions | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    const max = Number.isFinite(video.duration) ? video.duration : time
    const next = Math.min(Math.max(0, time), max)
    video.currentTime = next
    setCurrentTime(next)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch((err: unknown) => {
        console.warn('[VideoBlurEditor] play failed', err)
      })
    } else {
      video.pause()
    }
  }, [])

  const handlers = {
    onLoadedMetadata: (e: SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget
      setDuration(Number.isFinite(video.duration) ? video.duration : 0)
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setDimensions({ width: video.videoWidth, height: video.videoHeight })
      }
      setLoadError(false)
    },
    onTimeUpdate: (e: SyntheticEvent<HTMLVideoElement>) => {
      setCurrentTime(e.currentTarget.currentTime)
    },
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
    onError: () => setLoadError(true),
  }

  return {
    videoRef,
    currentTime,
    duration,
    dimensions,
    playing,
    loadError,
    seek,
    togglePlay,
    handlers,
  }
}
