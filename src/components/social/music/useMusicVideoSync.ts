'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { findMusicTrack, musicTrackUrl } from '@/lib/social/music/musicCatalog'
import type { MusicChoice } from '@/lib/social/music/musicTypes'

type VideoTarget = HTMLVideoElement | RefObject<HTMLVideoElement | null> | null

const resolve = (target: VideoTarget) => (target && 'current' in target ? target.current : target)

/**
 * Plays the chosen song alongside a <video> preview (looping like the final mix) at the chosen volumes.
 * A ref must already be attached when the caller mounts; pass the element (callback ref) if the video can remount.
 */
export function useMusicVideoSync(target: VideoTarget, music: MusicChoice | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const track = findMusicTrack(music?.trackId)
  const trackUrl = track ? musicTrackUrl(track) : ''

  useEffect(() => {
    const video = resolve(target)
    if (!video || !trackUrl) return
    const audio = new Audio(trackUrl)
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    const sync = () => {
      const len = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0
      audio.currentTime = len ? video.currentTime % len : video.currentTime
    }
    const play = () => {
      sync()
      audio.play().catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) console.error('[Music] preview sync failed', err)
      })
    }
    const pause = () => audio.pause()
    video.addEventListener('play', play)
    video.addEventListener('pause', pause)
    video.addEventListener('ended', pause)
    video.addEventListener('seeked', sync)
    if (!video.paused) play()
    return () => {
      video.removeEventListener('play', play)
      video.removeEventListener('pause', pause)
      video.removeEventListener('ended', pause)
      video.removeEventListener('seeked', sync)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [target, trackUrl])

  const volume = music?.volume ?? 0
  const originalVolume = music ? music.originalVolume : 1
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    const video = resolve(target)
    if (!video) return
    video.volume = originalVolume
    return () => {
      video.volume = 1
    }
  }, [target, trackUrl, volume, originalVolume])
}
