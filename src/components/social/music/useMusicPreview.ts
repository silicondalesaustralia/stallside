'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { musicTrackUrl } from '@/lib/social/music/musicCatalog'
import type { MusicTrack } from '@/lib/social/music/musicTypes'

function startTrack(audio: HTMLAudioElement, url: string, onEnded: () => void): Promise<void> {
  audio.pause()
  audio.src = url
  audio.onended = onEnded
  return audio.play()
}

/** One shared audio element so only one song previews at a time. */
export function useMusicPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setPlayingId(null)
    setLoadingId(null)
  }, [])

  const toggle = useCallback(
    async (track: MusicTrack) => {
      if (playingId === track.id || loadingId === track.id) return stop()
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      setError(null)
      setLoadingId(track.id)
      setPlayingId(null)
      try {
        await startTrack(audio, musicTrackUrl(track), () => setPlayingId(null))
        setPlayingId(track.id)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[Music] preview failed', err)
        setError('That song would not play - try another.')
      } finally {
        setLoadingId((id) => (id === track.id ? null : id))
      }
    },
    [playingId, loadingId, stop],
  )

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  return { playingId, loadingId, error, toggle, stop }
}
